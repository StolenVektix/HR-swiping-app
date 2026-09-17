import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login({ email, password });
      login(data);
      navigate(data.role === "worker" ? "/worker" : "/employer");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page-content" style={{ display: "flex", justifyContent: "center", paddingTop: 60 }}>
        <div className="card" style={{ width: 400 }}>
          <h1 style={{ fontSize: 26, marginTop: 0 }}>Connexion</h1>
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-text">{error}</div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>
          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 20, textAlign: "center" }}>
            Pas encore de compte ?{" "}
            <Link to="/register" style={{ color: "var(--orange)", fontWeight: 600 }}>
              Inscris-toi
            </Link>
          </p>
          <p style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 12, textAlign: "center" }}>
            Démo : employeur.bordeaux@demo.fr / demo1234 · interimaire@demo.fr / demo1234
          </p>
        </div>
      </main>
    </div>
  );
}
