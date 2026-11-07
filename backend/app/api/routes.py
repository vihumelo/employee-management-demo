from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.logging_config import get_logger
from app.database.models import Employee
from app.database.session import get_db
from app.repositories import employees
from app.schemas.employee import Employee as EmployeeSchema
from app.schemas.employee import EmployeeCreate
from app.schemas.error import ErrorResponse

router = APIRouter(
    tags=["Employees"],
    responses={
        500: {
            "model": ErrorResponse,
            "description": "Internal server error",
        }
    },
)
logger = get_logger("EmployeeAPI")


@router.get("/employees", response_model=list[EmployeeSchema])
def list_employees(
    db: Annotated[Session, Depends(get_db)],
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=1000)] = 100,
) -> list[Employee]:
    return employees.get_employees(db, skip, limit)


@router.get(
    "/employees/{employee_id}",
    response_model=EmployeeSchema,
    responses={404: {"model": ErrorResponse, "description": "Employee not found"}},
)
def get_employee(
    db: Annotated[Session, Depends(get_db)], employee_id: int
) -> Employee:
    employee = employees.get_employee_by_id(db, employee_id)
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
        )
    return employee


@router.post(
    "/employees",
    response_model=EmployeeSchema,
    status_code=status.HTTP_201_CREATED,
    responses={
        409: {
            "model": ErrorResponse,
            "description": "An employee with this CPF is already registered",
        }
    },
)
def create_employee(
    db: Annotated[Session, Depends(get_db)], employee: EmployeeCreate
) -> Employee:
    if employees.get_employee_by_cpf(db, cpf_id=employee.cpf) is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This employee is already registered",
        )
    try:
        created_employee = employees.create_employee(db=db, employee=employee)
        logger.info("Employee created id=%s", created_employee.id)
        return created_employee
    except IntegrityError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This employee is already registered",
        ) from error


@router.delete(
    "/employees/{employee_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
    responses={404: {"model": ErrorResponse, "description": "Employee not found"}},
)
def delete_employee(
    db: Annotated[Session, Depends(get_db)], employee_id: int
) -> Response:
    employee = employees.delete_employee(db, employee_id)
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
        )
    logger.info("Employee deleted id=%s", employee_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.put(
    "/employees/{employee_id}",
    response_model=EmployeeSchema,
    responses={
        404: {"model": ErrorResponse, "description": "Employee not found"},
        409: {
            "model": ErrorResponse,
            "description": "An employee with this CPF already exists",
        },
    },
)
def update_employee(
    db: Annotated[Session, Depends(get_db)],
    employee_id: int,
    employee_data: EmployeeCreate,
) -> Employee:
    try:
        employee = employees.update_employee(db, employee_id, employee_data)
    except IntegrityError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An employee with this tax identifier already exists",
        ) from error
    if employee is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found"
        )
    logger.info("Employee updated id=%s", employee.id)
    return employee
