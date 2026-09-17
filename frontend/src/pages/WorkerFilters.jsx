import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

const emptyFilter = {
  location: "",
  pay_min: "",
  schedule_type: "",
  period_start: "",
  period_end: "",
  keywords: "",
};

export default function WorkerFilters() {
  const { auth } = useAuth();
  const [filter, setFilter] = useState(emptyFilter);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await api.getFilter(auth.access_token);
        setFilter({
          location: data.location || "",
          pay_min: data.pay_min ?? "",
          schedule_type: data.schedule_type || "",
          period_start: data.period_start || "",
          period_end: data.period_end || "",
          keywords: data.keywords || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (field) => (e) => {
    setSaved(false);
    setFilter((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        location: filter.location || null,
        pay_min: filter.pay_min === "" ? null : parseFloat(filter.pay_min),
        schedule_type: filter.schedule_type || null,
        period_start: filter.period_start || null,
        period_end: filter.period_end || null,
        keywords: filter.keywords,
      };
      await api.updateFilter(auth.access_token, payload);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Navbar />
        <main className="page-content container">Chargement...</main>
      </div>
    );
  }

  return (
    <div className="page">
      <Navbar />
      <main className="page-content container" style={{ maxWidth: 560 }}>
        <h1 style={{ fontSize: 28 }}>Mes critères de recherche</h1>
        <p style={{ color: "var(--text-muted)" }}>
          Seules les annonces correspondant à ces critères apparaîtront dans ton fil de swipe.
        </p>

        <form className="card" onSubmit={handleSubmit}>
          <div className="field">
            <label>Localisation</label>
            <select value={filter.location} onChange={update("location")}>
              <option value="">Toutes</option>
              <option value="bordeaux">Bordeaux</option>
              <option value="paris">Paris</option>
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Rémunération minimum (€)</label>
              <input type="number" min="0" step="0.5" value={filter.pay_min} onChange={update("pay_min")} />
            </div>
            <div className="field">
              <label>Temps de travail</label>
              <select value={filter.schedule_type} onChange={update("schedule_type")}>
                <option value="">Peu importe</option>
                <option value="full_time">Temps plein</option>
                <option value="part_time">Temps partiel</option>
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Disponible à partir du</label>
              <input type="date" value={filter.period_start} onChange={update("period_start")} />
            </div>
            <div className="field">
              <label>Disponible jusqu'au</label>
              <input type="date" value={filter.period_end} onChange={update("period_end")} />
            </div>
          </div>

          <div className="field">
            <label>Mots-clés</label>
            <input
              placeholder="ex : service, logistique, vendanges..."
              value={filter.keywords}
              onChange={update("keywords")}
            />
          </div>

          {error && <div className="error-text">{error}</div>}
          {saved && <div style={{ color: "var(--success)", fontSize: 14, marginTop: 8 }}>Critères enregistrés ✓</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={saving} style={{ marginTop: 12 }}>
            {saving ? "Enregistrement..." : "Enregistrer mes critères"}
          </button>
        </form>
      </main>
    </div>
  );
}
