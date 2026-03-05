import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ title }) {
  const navigate = useNavigate();

  const user = useMemo(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <header className="glass-card mb-4 flex items-center justify-between px-4 py-3 md:px-5">
      <div>
        <h1 className="text-xl font-semibold text-darkText">{title}</h1>
        <p className="text-sm text-darkText/70">
          {user?.name || "User"} • {user?.role || "member"}
        </p>
      </div>
      <button className="btn-secondary" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}

export default Navbar;
