import { useEffect, useMemo, useState } from "react";
import { getApiErrorMessage } from "../services/apiError";
import { employeeService } from "../services/employeeService";
import type { Employee } from "../types/employee";

const PAGE_SIZE = 8;

const useEmployeeList = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<{
    employeeId: number;
    message: string;
  } | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setLoadErrorMessage(null);

    employeeService
      .listAll(controller.signal)
      .then(setEmployees)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadErrorMessage(getApiErrorMessage(error));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [reloadKey]);

  const filteredEmployees = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return employees;

    return employees.filter((employee) =>
      [employee.name, employee.cpf, employee.role ?? ""]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [employees, query]);

  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const visibleEmployees = filteredEmployees.slice(pageStart, pageStart + PAGE_SIZE);

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [currentPage, page]);

  const refreshEmployees = () => setReloadKey((currentKey) => currentKey + 1);

  const handleDelete = async (employeeId: number) => {
    setDeleteError(null);
    setIsDeleting(true);
    try {
      await employeeService.delete(employeeId);
      setEmployees((currentEmployees) =>
        currentEmployees.filter((employee) => employee.id !== employeeId),
      );
    } catch (error) {
      setDeleteError({ employeeId, message: getApiErrorMessage(error) });
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    currentPage,
    deleteError,
    filteredEmployeeCount: filteredEmployees.length,
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
  };
};

export default useEmployeeList;
