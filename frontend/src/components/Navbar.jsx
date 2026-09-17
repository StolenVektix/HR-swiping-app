import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { auth, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      style={{
        background: "var(--navy-900)",
        color: "white",
        padding: "18px 0",
      }}
    >
      <div className="container navbar-inner">
        <Link
          to="/"
          style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: "white", flexShrink: 0 }}
        >
          Missio<span style={{ color: "var(--orange)" }}>.</span>
        </Link>

        <nav className="navbar-links">
          {auth?.role === "worker" && (
            <>
              <Link to="/worker" style={{ opacity: 0.85, fontWeight: 500 }}>
                Swiper
              </Link>
              <Link to="/worker/filters" style={{ opacity: 0.85, fontWeight: 500 }}>
                Mes critères
              </Link>
              <Link to="/worker/matches" style={{ opacity: 0.85, fontWeight: 500 }}>
                Mes matches
              </Link>
            </>
          )}
          {auth?.role === "employer" && (
            <Link to="/employer" style={{ opacity: 0.85, fontWeight: 500 }}>
              Mes annonces
            </Link>
          )}

          {auth ? (
            <>
              <span className="navbar-display-name">{auth.display_name}</span>
              <button
                onClick={handleLogout}
                className="btn btn-ghost"
                style={{ color: "white", padding: "8px 14px" }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
