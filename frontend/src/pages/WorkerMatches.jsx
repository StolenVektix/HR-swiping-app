import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const PAY_UNIT_LABEL = { hour: "€/heure", day: "€/jour", mission: "€/mission" };
const LOCATION_LABEL = { bordeaux: "Bordeaux", paris: "Paris" };

export default function WorkerMatches() {
  const { auth } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.myMatches(auth.access_token);
        setMatches(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="page">
      <Navbar />
      <main className="page-content container">
        <h1 style={{ fontSize: 28 }}>Mes matches</h1>

        {loading && <p>Chargement...</p>}
        {error && <div className="error-text">{error}</div>}

        {!loading && matches.length === 0 && (
          <div className="empty-state card">Aucun match pour l'instant. Va swiper des annonces !</div>
        )}

        <div style={{ display: "grid", gap: 16 }}>
          {matches.map((m, i) => (
            <div key={i} className="card">
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                <h3 style={{ margin: 0 }}>{m.listing.title}</h3>
                <span className="badge badge-navy">{LOCATION_LABEL[m.listing.location]}</span>
              </div>
              <div style={{ color: "var(--text-muted)", marginBottom: 8 }}>{m.listing.employer.company_name}</div>
              <p style={{ margin: "0 0 10px" }}>{m.listing.description}</p>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>
                {m.listing.pay_amount} {PAY_UNIT_LABEL[m.listing.pay_unit]}
              </div>
              <div style={{ fontSize: 14 }}>📧 Contact employeur : {m.employer_email}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
