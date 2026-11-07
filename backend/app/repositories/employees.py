from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import models
from app.schemas.employee import EmployeeCreate


def _commit(db: Session) -> None:
    try:
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise


def get_employee_by_cpf(db: Session, cpf_id: str) -> models.Employee | None:
    statement = select(models.Employee).where(models.Employee.cpf == cpf_id)
    return db.scalar(statement)


def get_employee_by_id(db: Session, employee_id: int) -> models.Employee | None:
    statement = select(models.Employee).where(models.Employee.id == employee_id)
    return db.scalar(statement)


def get_employees(
    db: Session, skip: int = 0, limit: int = 100
) -> list[models.Employee]:
    statement = (
        select(models.Employee)
        .order_by(models.Employee.id)
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(statement).all())


def delete_employee(db: Session, employee_id: int) -> models.Employee | None:
    employee = get_employee_by_id(db, employee_id)
    if employee is not None:
        db.delete(employee)
        _commit(db)
    return employee


def create_employee(db: Session, employee: EmployeeCreate) -> models.Employee:
    db_employee = models.Employee(
        name=employee.name,
        rg=employee.rg,
        cpf=employee.cpf,
        birth_date=employee.birth_date,
        admission_date=employee.admission_date,
        role=employee.role,
    )
    db.add(db_employee)
    _commit(db)
    db.refresh(db_employee)
    return db_employee


def update_employee(
    db: Session, employee_id: int, employee_data: EmployeeCreate
) -> models.Employee | None:
    employee = get_employee_by_id(db, employee_id)
    if employee is None:
        return None

    employee.name = employee_data.name
    employee.rg = employee_data.rg
    employee.cpf = employee_data.cpf
    employee.birth_date = employee_data.birth_date
    employee.admission_date = employee_data.admission_date
    employee.role = employee_data.role

    db.add(employee)
    _commit(db)
    db.refresh(employee)
    return employee
