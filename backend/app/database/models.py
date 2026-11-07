from datetime import date

from sqlalchemy import Date, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class Employee(Base):
    __tablename__ = "employees"
    __table_args__ = (UniqueConstraint("cpf", name="uq_employees_cpf"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    rg: Mapped[str] = mapped_column(String(100), nullable=False)
    cpf: Mapped[str] = mapped_column(String(100), nullable=False)
    birth_date: Mapped[date] = mapped_column(Date, nullable=False)
    admission_date: Mapped[date] = mapped_column(Date, nullable=False)
    role: Mapped[str | None] = mapped_column(String(100), nullable=True)
