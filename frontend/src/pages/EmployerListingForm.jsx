import { useState } from "react";

const emptyForm = {
  title: "",
  description: "",
  pay_amount: "",
  pay_unit: "hour",
  schedule_type: "full_time",
  schedule_detail: "",
  period_start: "",
  period_end: "",
  location: "bordeaux",
};

export default function EmployerListingForm({ initial, onSubmit, onCancel, submitting }) {
  const [form, setForm] = useState(initial ? { ...emptyForm, ...initial } : emptyForm);
  const [error, setError] = useState("");

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (new Date(form.period_end) < new Date(form.period_start)) {
      setError("La date de fin doit être après la date de début");
      return;
    }
    try {
      await onSubmit({ ...form, pay_amount: parseFloat(form.pay_amount) });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
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
      <div className="card" style={{ width: 560, maxHeight: "88vh", overflowY: "auto" }}>
        <h2 style={{ marginTop: 0 }}>{initial ? "Modifier l'annonce" : "Nouvelle annonce"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Titre du poste</label>
            <input value={form.title} onChange={update("title")} required />
          </div>
          <div className="field">
            <label>Description</label>
            <textarea rows={4} value={form.description} onChange={update("description")} />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Rémunération</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={form.pay_amount}
                onChange={update("pay_amount")}
                required
              />
            </div>
            <div className="field">
              <label>Unité</label>
              <select value={form.pay_unit} onChange={update("pay_unit")}>
                <option value="hour">€ / heure</option>
                <option value="day">€ / jour</option>
                <option value="mission">€ / mission</option>
              </select>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Temps de travail</label>
              <select value={form.schedule_type} onChange={update("schedule_type")}>
                <option value="full_time">Temps plein</option>
                <option value="part_time">Temps partiel</option>
              </select>
            </div>
            <div className="field">
              <label>Détail (ex : 35h/semaine)</label>
              <input value={form.schedule_detail} onChange={update("schedule_detail")} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Début de mission</label>
              <input type="date" value={form.period_start} onChange={update("period_start")} required />
            </div>
            <div className="field">
              <label>Fin de mission</label>
              <input type="date" value={form.period_end} onChange={update("period_end")} required />
            </div>
          </div>

          <div className="field">
            <label>Localisation</label>
            <select value={form.location} onChange={update("location")}>
              <option value="bordeaux">Bordeaux</option>
              <option value="paris">Paris</option>
            </select>
          </div>

          {error && <div className="error-text">{error}</div>}

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
