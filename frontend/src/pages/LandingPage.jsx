import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  const { auth } = useAuth();

  return (
    <div className="page">
      <Navbar />
      <main className="page-content">
        <section
          style={{
            background: "linear-gradient(160deg, var(--navy-900), var(--navy-700))",
            color: "white",
            padding: "90px 0 100px",
          }}
        >
          <div className="container" style={{ textAlign: "center" }}>
            <div className="badge" style={{ marginBottom: 20 }}>
              Bordeaux · Paris
            </div>
            <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.15, maxWidth: 720, margin: "0 auto" }}>
              Trouve ta prochaine mission d'un simple <span style={{ color: "var(--orange)" }}>swipe</span>
            </h1>
            <p style={{ fontSize: 18, opacity: 0.8, maxWidth: 560, margin: "20px auto 36px" }}>
              Missio connecte les employeurs et les intérimaires. Tu es indépendant… mais jamais seul.
            </p>

            {!auth && (
              <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
                <Link to="/register?role=worker" className="btn btn-primary">
                  Je cherche une mission
                </Link>
                <Link
                  to="/register?role=employer"
                  className="btn btn-secondary"
                  style={{ background: "transparent", color: "white", borderColor: "rgba(255,255,255,0.4)" }}
                >
                  Je recrute
                </Link>
              </div>
            )}
            {auth && (
              <Link to={auth.role === "worker" ? "/worker" : "/employer"} className="btn btn-primary">
                Accéder à mon espace
              </Link>
            )}
          </div>
        </section>

        <section className="container" style={{ marginTop: 60 }}>
          <div className="features-grid">
            <FeatureCard
              icon="⚡"
              title="Rapide"
              text="Swipe à droite pour matcher, à gauche pour passer. Plus de recherche interminable."
            />
            <FeatureCard
              icon="🎯"
              title="Ciblé"
              text="Définis tes critères (lieu, rémunération, période) et ne vois que les annonces pertinentes."
            />
            <FeatureCard
              icon="🤝"
              title="Direct"
              text="Dès le match, l'employeur voit ton profil et peut te contacter immédiatement."
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="card">
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ margin: "0 0 8px", fontSize: 18 }}>{title}</h3>
      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 14.5, lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}
