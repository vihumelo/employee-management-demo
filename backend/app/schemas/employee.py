from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class EmployeeBase(BaseModel):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=100)
    admission_date: date
    rg: str = Field(max_length=100)
    cpf: str = Field(max_length=100)
    birth_date: date
    role: str | None = Field(default=None, max_length=100)


class Employee(EmployeeBase):
    id: int


class EmployeeCreate(EmployeeBase):
    pass
