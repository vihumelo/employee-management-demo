"""Create the initial employee schema."""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

revision: str = "20261107a001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "employees",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("rg", sa.String(length=100), nullable=False),
        sa.Column("cpf", sa.String(length=100), nullable=False),
        sa.Column("birth_date", sa.Date(), nullable=False),
        sa.Column("admission_date", sa.Date(), nullable=False),
        sa.Column("role", sa.String(length=100), nullable=True),
        sa.UniqueConstraint("cpf", name="uq_employees_cpf"),
    )


def downgrade() -> None:
    op.drop_table("employees")
