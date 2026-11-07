import { Outlet, useMatch, useNavigate } from "react-router-dom";
import EmployeeActionsMenu from "../components/ui/EmployeeActionsMenu";
import AppButton from "../components/ui/AppButton";
import RoleBadge from "../components/ui/RoleBadge";
import SearchField from "../components/ui/SearchField";
import SurfaceCard from "../components/ui/SurfaceCard";
import useEmployeeList from "../hooks/useEmployeeList";
import type { Employee } from "../types/employee";
import { formatEmployeeCpf, formatEmployeeDate } from "../utils/employeeFormatters";
import "../styles/EmployeeListPage.css";

export interface EmployeeListOutletContext {
  refreshEmployees: () => void;
}

const EmployeeListPage = () => {
  const navigate = useNavigate();
  const {
    currentPage,
    deleteError,
    filteredEmployeeCount,
    handleDelete,
    isDeleting,
    isLoading,
    loadErrorMessage,
    pageCount,
    pageStart,
    query,
    refreshEmployees,
    setPage,
    setQuery,
    visibleEmployees,
  } = useEmployeeList();
  const isCreateRoute = useMatch("/employees/new");
  const isEditRoute = useMatch("/employees/:employeeId/edit");
  const hasFormPanel = Boolean(isCreateRoute || isEditRoute);

  const renderActions = (employee: Employee) => (
    <EmployeeActionsMenu
      employeeName={employee.name}
      onView={() => navigate(`/employees/${employee.id}`)}
      onEdit={() => navigate(`/employees/${employee.id}/edit`)}
      onDelete={() => void handleDelete(employee.id)}
    />
  );

  return (
    <div className={`employee-list-layout${hasFormPanel ? " has-form-panel" : ""}`}>
      <main className="employee-list-main" aria-busy={isLoading || isDeleting}>
        <div className="employee-list-heading">
          <div>
            <h1>Employees</h1>
            <p>Manage your company&apos;s employee records.</p>
          </div>
        </div>

        <div className="employee-list-toolbar">
          <SearchField
            value={query}
            onValueChange={(value) => {
              setQuery(value);
              setPage(1);
            }}
            placeholder="Search by name, CPF, or role..."
          />
          <AppButton onPress={() => navigate("/employees/new")}>
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Add Employee
          </AppButton>
        </div>

        {loadErrorMessage && (
          <div className="feedback-message employee-page-alert" role="alert">
            <span>{loadErrorMessage}</span>
            <AppButton
              variant="secondary"
              onPress={refreshEmployees}
            >
              Try Again
            </AppButton>
          </div>
        )}

        {deleteError && (
          <div className="feedback-message employee-page-alert" role="alert">
            <span>{deleteError.message}</span>
            <AppButton
              variant="secondary"
              isDisabled={isDeleting}
              onPress={() => void handleDelete(deleteError.employeeId)}
            >
              Retry Delete
            </AppButton>
          </div>
        )}

        {isLoading ? (
          <SurfaceCard className="employee-list-state">
            <p role="status" aria-live="polite">Loading employees…</p>
          </SurfaceCard>
        ) : !loadErrorMessage && filteredEmployeeCount === 0 ? (
          <SurfaceCard className="employee-list-state">
            <h2>{query ? "No matching employees" : "No employees yet"}</h2>
            <p>
              {query
                ? "Try a different name, CPF, or role."
                : "Add an employee to get started."}
            </p>
          </SurfaceCard>
        ) : !loadErrorMessage ? (
          <SurfaceCard className="employee-table-card" contentClassName="employee-table-card-content">
            <div
              className="employee-table-scroll"
              role="region"
              aria-label="Employee records"
              tabIndex={0}
            >
              <table className="employee-table">
                <caption className="visually-hidden">Employee records</caption>
                <thead>
                  <tr>
                    <th scope="col">ID</th>
                    <th scope="col">Name</th>
                    <th scope="col">CPF</th>
                    <th scope="col">Role</th>
                    <th scope="col">Admission</th>
                    <th scope="col"><span className="visually-hidden">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {visibleEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td className="employee-name-cell">{employee.name}</td>
                      <td>{formatEmployeeCpf(employee.cpf)}</td>
                      <td><RoleBadge role={employee.role} /></td>
                      <td>{formatEmployeeDate(employee.admission_date)}</td>
                      <td className="employee-action-cell">{renderActions(employee)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="employee-mobile-list" aria-label="Employee records">
              {visibleEmployees.map((employee) => (
                <article className="employee-mobile-card" key={employee.id}>
                  <div className="employee-mobile-card-heading">
                    <div>
                      <span className="employee-mobile-id">Employee #{employee.id}</span>
                      <h2>{employee.name}</h2>
                    </div>
                    {renderActions(employee)}
                  </div>
                  <dl>
                    <div><dt>CPF</dt><dd>{formatEmployeeCpf(employee.cpf)}</dd></div>
                    <div><dt>Role</dt><dd><RoleBadge role={employee.role} /></dd></div>
                    <div><dt>Admission</dt><dd>{formatEmployeeDate(employee.admission_date)}</dd></div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="employee-table-footer">
              <p>
                Showing {pageStart + 1}–{Math.min(pageStart + visibleEmployees.length, filteredEmployeeCount)} of {filteredEmployeeCount} employees
              </p>
              {pageCount > 1 && (
                <nav className="employee-pagination" aria-label="Employee list pages">
                  <AppButton
                    variant="secondary"
                    isIconOnly
                    aria-label="Previous page"
                    isDisabled={currentPage === 1}
                    onPress={() => setPage((currentPageValue) => Math.max(1, currentPageValue - 1))}
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </AppButton>
                  <span aria-current="page">{currentPage}</span>
                  <AppButton
                    variant="secondary"
                    isIconOnly
                    aria-label="Next page"
                    isDisabled={currentPage === pageCount}
                    onPress={() => setPage((currentPageValue) => Math.min(pageCount, currentPageValue + 1))}
                  >
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </AppButton>
                </nav>
              )}
            </div>
          </SurfaceCard>
        ) : null}
      </main>

      <Outlet context={{ refreshEmployees } satisfies EmployeeListOutletContext} />
    </div>
  );
};

export default EmployeeListPage;
