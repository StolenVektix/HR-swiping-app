import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import SwipeCard from "../components/SwipeCard";

export default function WorkerSwipe() {
  const { auth } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const topCardRef = useRef(null);

  const loadFeed = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getFeed(auth.access_token);
      setCards(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleSwiped = async (listingId, direction) => {
    setCards((prev) => prev.filter((c) => c.id !== listingId));
    try {
      const res = await api.swipe(auth.access_token, { listing_id: listingId, direction });
      if (res.is_match) {
        setToast("C'est un match ! 🎉");
        setTimeout(() => setToast(null), 2200);
      }
    } catch {
      // la carte a déjà disparu de la pile, on ignore l'échec réseau ici
    }
  };

  const triggerTopSwipe = (direction) => {
    if (topCardRef.current) topCardRef.current.triggerSwipe(direction);
  };

  const visibleCards = cards.slice(0, 3);

  return (
    <div className="page">
      <Navbar />
      <main
        className="page-content container"
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Swipe tes prochaines missions</h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 28 }}>
          ✕ pour passer · ♥ pour matcher
        </p>

        {loading && <p>Chargement...</p>}
        {error && <div className="error-text">{error}</div>}

        {!loading && !error && cards.length === 0 && (
          <div className="empty-state card" style={{ maxWidth: 380 }}>
            Plus d'annonce à afficher pour le moment. Reviens plus tard ou élargis tes{" "}
            <Link to="/worker/filters" style={{ color: "var(--orange)", fontWeight: 600 }}>
              critères
            </Link>
            .
          </div>
        )}

        {!loading && cards.length > 0 && (
          <>
            <div className="swipe-stack">
              {visibleCards.map((listing, index) => (
                <SwipeCard
                  key={listing.id}
                  ref={index === 0 ? topCardRef : null}
                  listing={listing}
                  index={index}
                  onSwiped={(direction) => handleSwiped(listing.id, direction)}
                />
              ))}
            </div>

            <div className="swipe-actions">
              <button className="action-btn reject" onClick={() => triggerTopSwipe("reject")}>
                ✕
              </button>
              <button className="action-btn match" onClick={() => triggerTopSwipe("match")}>
                ♥
              </button>
            </div>
          </>
        )}

        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: 40,
              left: "50%",
              transform: "translateX(-50%)",
              background: "var(--navy-900)",
              color: "white",
              padding: "14px 28px",
              borderRadius: 999,
              fontWeight: 700,
              boxShadow: "var(--shadow-card)",
            }}
          >
            {toast}
          </div>
        )}
      </main>
    </div>
  );
}
