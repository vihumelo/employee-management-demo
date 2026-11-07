import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import AppShell from "./AppShell";
import EmployeeListPage from "../pages/EmployeeListPage";
import EmployeeDetailsPage from "../pages/EmployeeDetailsPage";
import EmployeeEditPage from "../pages/EmployeeEditPage";
import EmployeeCreatePage from "../pages/EmployeeCreatePage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<EmployeeListPage />}>
            <Route path="employees/new" element={<EmployeeCreatePage />} />
            <Route path="employees/:employeeId/edit" element={<EmployeeEditPage />} />
          </Route>
          <Route path="employees/:employeeId" element={<EmployeeDetailsPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
