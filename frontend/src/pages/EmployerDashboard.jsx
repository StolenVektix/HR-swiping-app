import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import EmployerListingForm from "./EmployerListingForm";

const PAY_UNIT_LABEL = { hour: "€/heure", day: "€/jour", mission: "€/mission" };
const SCHEDULE_LABEL = { full_time: "Temps plein", part_time: "Temps partiel" };
const LOCATION_LABEL = { bordeaux: "Bordeaux", paris: "Paris" };

export default function EmployerDashboard() {
  const { auth } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formTarget, setFormTarget] = useState(null); // { } for new, listing for edit, null for closed
  const [submitting, setSubmitting] = useState(false);
  const [matchesFor, setMatchesFor] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  const loadListings = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.listMyListings(auth.access_token);
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleCreate = async (payload) => {
    setSubmitting(true);
    try {
      await api.createListing(auth.access_token, payload);
      setFormTarget(null);
      await loadListings();
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (payload) => {
    setSubmitting(true);
    try {
      await api.updateListing(auth.access_token, formTarget.id, payload);
      setFormTarget(null);
      await loadListings();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    await api.deleteListing(auth.access_token, id);
    await loadListings();
  };

  const handleToggleActive = async (listing) => {
    await api.updateListing(auth.access_token, listing.id, { is_active: !listing.is_active });
    await loadListings();
  };

  const openMatches = async (listing) => {
    setMatchesFor(listing);
    setMatchesLoading(true);
    try {
      const data = await api.listingMatches(auth.access_token, listing.id);
      setMatches(data);
    } finally {
      setMatchesLoading(false);
    }
  };

  return (
    <div className="page">
      <Navbar />
      <main className="page-content container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <h1 style={{ margin: 0, fontSize: 28 }}>Mes annonces</h1>
          <button className="btn btn-primary" onClick={() => setFormTarget({})}>
            + Nouvelle annonce
          </button>
        </div>

        {loading && <p>Chargement...</p>}
        {error && <div className="error-text">{error}</div>}

        {!loading && listings.length === 0 && (
          <div className="empty-state card">Aucune annonce pour l'instant. Crée ta première annonce !</div>
        )}

        <div style={{ display: "grid", gap: 16 }}>
          {listings.map((listing) => (
            <div key={listing.id} className="card" style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                  <h3 style={{ margin: 0 }}>{listing.title}</h3>
                  <span className="badge badge-navy">{LOCATION_LABEL[listing.location]}</span>
                  {!listing.is_active && <span className="badge">Inactive</span>}
                </div>
                <p style={{ color: "var(--text-muted)", margin: "0 0 8px", maxWidth: 520 }}>{listing.description}</p>
                <div style={{ fontSize: 14, color: "var(--navy-800)", fontWeight: 600 }}>
                  {listing.pay_amount} {PAY_UNIT_LABEL[listing.pay_unit]} · {SCHEDULE_LABEL[listing.schedule_type]}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
                <button className="btn btn-primary" onClick={() => openMatches(listing)}>
                  Voir les matches
                </button>
                <button className="btn btn-secondary" onClick={() => setFormTarget(listing)}>
                  Modifier
                </button>
                <button className="btn btn-secondary" onClick={() => handleToggleActive(listing)}>
                  {listing.is_active ? "Désactiver" : "Réactiver"}
                </button>
                <button className="btn btn-ghost" style={{ color: "var(--danger)" }} onClick={() => handleDelete(listing.id)}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {formTarget && (
        <EmployerListingForm
          initial={formTarget.id ? formTarget : null}
          submitting={submitting}
          onCancel={() => setFormTarget(null)}
          onSubmit={formTarget.id ? handleUpdate : handleCreate}
        />
      )}

      {matchesFor && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 22, 38, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 50,
          }}
        >
          <div className="card" style={{ width: 520, maxHeight: "80vh", overflowY: "auto" }}>
            <h2 style={{ marginTop: 0 }}>Candidats pour "{matchesFor.title}"</h2>
            {matchesLoading && <p>Chargement...</p>}
            {!matchesLoading && matches.length === 0 && (
              <div className="empty-state">Aucun match pour l'instant.</div>
            )}
            <div style={{ display: "grid", gap: 12 }}>
              {matches.map((m, i) => (
                <div key={i} className="card" style={{ boxShadow: "none", border: "1.5px solid var(--border)" }}>
                  <div style={{ fontWeight: 700 }}>{m.full_name}</div>
                  <div style={{ fontSize: 14, color: "var(--text-muted)", margin: "4px 0" }}>{m.bio}</div>
                  <div style={{ fontSize: 14 }}>📧 {m.email}</div>
                  {m.phone && <div style={{ fontSize: 14 }}>📞 {m.phone}</div>}
                </div>
              ))}
            </div>
            <button className="btn btn-secondary btn-block" style={{ marginTop: 20 }} onClick={() => setMatchesFor(null)}>
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
