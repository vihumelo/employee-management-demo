import logging
from io import StringIO

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session, sessionmaker

from app.core.logging_config import APP_LOGGER_NAME
from app.database.models import Employee


def employee_payload(
    *, cpf: str = "12345678900", name: str = "Ada Lovelace"
) -> dict[str, str]:
    return {
        "name": name,
        "admission_date": "2024-01-15",
        "rg": "RG-123",
        "cpf": cpf,
        "birth_date": "1815-12-10",
        "role": "Engineer",
    }


def employee_count(session_factory: sessionmaker[Session]) -> int:
    with session_factory() as session:
        return session.scalar(select(func.count()).select_from(Employee)) or 0


def test_create_employee_persists_record(
    client: TestClient, session_factory: sessionmaker[Session]
) -> None:
    payload = employee_payload()

    response = client.post("/employees", json=payload)

    assert response.status_code == 201
    response_data = response.json()
    assert response_data["id"] > 0
    assert response_data["name"] == payload["name"]
    assert response_data["cpf"] == payload["cpf"]

    with session_factory() as session:
        employee = session.scalar(
            select(Employee).where(Employee.cpf == payload["cpf"])
        )

    assert employee is not None
    assert employee.name == payload["name"]
    assert employee.admission_date.isoformat() == payload["admission_date"]


def test_list_employees_applies_pagination(client: TestClient) -> None:
    first_payload = employee_payload(cpf="11111111111", name="Ada Lovelace")
    second_payload = employee_payload(cpf="22222222222", name="Grace Hopper")
    assert client.post("/employees", json=first_payload).status_code == 201
    assert client.post("/employees", json=second_payload).status_code == 201

    response = client.get("/employees", params={"skip": 1, "limit": 1})

    assert response.status_code == 200
    assert [employee["cpf"] for employee in response.json()] == [second_payload["cpf"]]


def test_get_employee_returns_created_record(client: TestClient) -> None:
    created = client.post("/employees", json=employee_payload()).json()

    response = client.get(f"/employees/{created['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_update_and_delete_employee_persist_changes(
    client: TestClient, session_factory: sessionmaker[Session]
) -> None:
    created = client.post("/employees", json=employee_payload()).json()
    updated_payload = employee_payload(cpf="98765432100", name="Ada Byron")

    update_response = client.put(
        f"/employees/{created['id']}", json=updated_payload
    )
    assert update_response.status_code == 200
    assert update_response.json()["name"] == "Ada Byron"
    assert update_response.json()["cpf"] == updated_payload["cpf"]

    with session_factory() as session:
        updated_employee = session.get(Employee, created["id"])

    assert updated_employee is not None
    assert updated_employee.name == "Ada Byron"
    assert updated_employee.cpf == updated_payload["cpf"]

    delete_response = client.delete(f"/employees/{created['id']}")

    assert delete_response.status_code == 204
    assert delete_response.content == b""
    assert employee_count(session_factory) == 0


def test_missing_employee_returns_not_found(client: TestClient) -> None:
    assert client.get("/employees/999").status_code == 404
    assert client.put("/employees/999", json=employee_payload()).status_code == 404
    assert client.delete("/employees/999").status_code == 404


def test_invalid_employee_and_pagination_are_rejected(client: TestClient) -> None:
    invalid_payload = employee_payload(name="   ")

    assert client.post("/employees", json=invalid_payload).status_code == 422
    assert client.post("/employees", json={}).status_code == 422
    assert client.get("/employees", params={"skip": -1}).status_code == 422
    assert client.get("/employees", params={"limit": 1001}).status_code == 422


def test_duplicate_cpf_returns_conflict_without_duplicate_row(
    client: TestClient, session_factory: sessionmaker[Session]
) -> None:
    payload = employee_payload()
    assert client.post("/employees", json=payload).status_code == 201

    response = client.post("/employees", json=payload)

    assert response.status_code == 409
    assert employee_count(session_factory) == 1


def test_database_constraint_race_returns_conflict(
    client: TestClient,
    session_factory: sessionmaker[Session],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    payload = employee_payload()
    assert client.post("/employees", json=payload).status_code == 201

    def report_cpf_available(_session: Session, cpf_id: str) -> Employee | None:
        return None

    from app.repositories import employees

    monkeypatch.setattr(employees, "get_employee_by_cpf", report_cpf_available)
    response = client.post("/employees", json=payload)

    assert response.status_code == 409
    assert employee_count(session_factory) == 1


def test_update_constraint_failure_rolls_back_changes(
    client: TestClient, session_factory: sessionmaker[Session]
) -> None:
    first = client.post(
        "/employees", json=employee_payload(cpf="11111111111", name="First")
    ).json()
    client.post("/employees", json=employee_payload(cpf="22222222222", name="Second"))
    conflicting_payload = employee_payload(cpf="22222222222", name="Changed")

    response = client.put(
        f"/employees/{first['id']}", json=conflicting_payload
    )

    assert response.status_code == 409
    with session_factory() as session:
        unchanged_employee = session.get(Employee, first["id"])

    assert unchanged_employee is not None
    assert unchanged_employee.name == "First"
    assert unchanged_employee.cpf == "11111111111"
    assert employee_count(session_factory) == 2


def test_unexpected_failure_returns_generic_response_and_safe_log(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    def fail_to_list(
        _session: Session, skip: int = 0, limit: int = 100
    ) -> list[Employee]:
        raise RuntimeError("sensitive database details")

    from app.repositories import employees

    monkeypatch.setattr(employees, "get_employees", fail_to_list)
    log_output = StringIO()
    handler = logging.StreamHandler(log_output)
    app_logger = logging.getLogger(APP_LOGGER_NAME)
    app_logger.addHandler(handler)
    try:
        response = client.get("/employees")
    finally:
        app_logger.removeHandler(handler)

    assert response.status_code == 500
    assert response.json() == {"detail": "Internal server error"}
    assert "RuntimeError" in log_output.getvalue()
    assert "sensitive database details" not in log_output.getvalue()
