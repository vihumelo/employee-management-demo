import { Outlet, Link } from "react-router-dom";
import "../styles/AppShell.css";

const AppShell = () => (
  <div className="app-shell">
    <header className="app-header">
      <Link className="app-brand" to="/" aria-label="Employee Management home">
        <span className="app-brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M16 19.25v-1.5a3.25 3.25 0 0 0-3.25-3.25h-5.5A3.25 3.25 0 0 0 4 17.75v1.5M10 11a3.25 3.25 0 1 0 0-6.5 3.25 3.25 0 0 0 0 6.5ZM16 5a3 3 0 0 1 0 5.82m4 8.43v-1.5a3.25 3.25 0 0 0-2.5-3.16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>Employee Management</span>
      </Link>

    </header>

    <div className="app-content">
      <Outlet />
    </div>
  </div>
);

export default AppShell;
