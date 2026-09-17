import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(searchParams.get("role") === "employer" ? "employer" : "worker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        email,
        password,
        role,
        company_name: role === "employer" ? companyName : undefined,
        full_name: role === "worker" ? fullName : undefined,
        phone: role === "worker" ? phone : undefined,
      };
      const data = await api.register(payload);
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
        <div className="card" style={{ width: 440 }}>
          <h1 style={{ fontSize: 26, marginTop: 0 }}>Créer un compte</h1>

          <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
            <RoleButton label="Je suis intérimaire" active={role === "worker"} onClick={() => setRole("worker")} />
            <RoleButton label="Je recrute" active={role === "employer"} onClick={() => setRole("employer")} />
          </div>

          <form onSubmit={handleSubmit}>
            {role === "employer" ? (
              <div className="field">
                <label>Nom de l'entreprise</label>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
            ) : (
              <>
                <div className="field">
                  <label>Nom complet</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div className="field">
                  <label>Téléphone</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="06 xx xx xx xx" />
                </div>
              </>
            )}

            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label>Mot de passe</label>
              <input
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <div className="error-text">{error}</div>}
            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 20, textAlign: "center" }}>
            Déjà inscrit ?{" "}
            <Link to="/login" style={{ color: "var(--orange)", fontWeight: 600 }}>
              Connecte-toi
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function RoleButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn"
      style={{
        flex: 1,
        background: active ? "var(--navy-900)" : "var(--bg)",
        color: active ? "white" : "var(--navy-800)",
      }}
    >
      {label}
    </button>
  );
}
