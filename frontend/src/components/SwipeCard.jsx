import { forwardRef, useImperativeHandle } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";

const SWIPE_THRESHOLD = 110;

const PAY_UNIT_LABEL = { hour: "€/heure", day: "€/jour", mission: "€/mission" };
const SCHEDULE_LABEL = { full_time: "Temps plein", part_time: "Temps partiel" };
const LOCATION_LABEL = { bordeaux: "Bordeaux", paris: "Paris" };

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const SwipeCard = forwardRef(function SwipeCard({ listing, index, onSwiped }, ref) {
  const active = index === 0;
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-320, 320], [-18, 18]);
  const matchOpacity = useTransform(x, [30, 120], [0, 1]);
  const passOpacity = useTransform(x, [-120, -30], [1, 0]);

  useImperativeHandle(ref, () => ({
    triggerSwipe(direction) {
      const target = direction === "match" ? 700 : -700;
      animate(x, target, {
        duration: 0.35,
        ease: "easeIn",
        onComplete: () => onSwiped(direction),
      });
    },
  }));

  const handleDragEnd = (_, info) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      animate(x, 700, { duration: 0.3, ease: "easeIn", onComplete: () => onSwiped("match") });
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      animate(x, -700, { duration: 0.3, ease: "easeIn", onComplete: () => onSwiped("reject") });
    } else {
      animate(x, 0, { type: "spring", stiffness: 350, damping: 24 });
    }
  };

  return (
    <motion.div
      className="swipe-card"
      style={{ x, rotate, zIndex: 10 - index }}
      drag={active ? "x" : false}
      dragElastic={0.7}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      initial={false}
      animate={{ scale: 1 - index * 0.04, y: index * 14 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div className="stamp stamp-match" style={{ opacity: matchOpacity }}>
        Match
      </motion.div>
      <motion.div className="stamp stamp-pass" style={{ opacity: passOpacity }}>
        Passe
      </motion.div>

      <div className="swipe-card-header">
        <div className="swipe-card-location">📍 {LOCATION_LABEL[listing.location]}</div>
        <h2 className="swipe-card-title">{listing.title}</h2>
        <div className="swipe-card-company">{listing.employer.company_name}</div>
      </div>

      <div className="swipe-card-body">
        <p className="swipe-card-desc">{listing.description}</p>

        <div className="swipe-card-meta">
          <div className="meta-chip">
            <div className="meta-chip-label">Rémunération</div>
            <div className="meta-chip-value">
              {listing.pay_amount} {PAY_UNIT_LABEL[listing.pay_unit]}
            </div>
          </div>
          <div className="meta-chip">
            <div className="meta-chip-label">Temps de travail</div>
            <div className="meta-chip-value">{SCHEDULE_LABEL[listing.schedule_type]}</div>
          </div>
          <div className="meta-chip">
            <div className="meta-chip-label">Période</div>
            <div className="meta-chip-value">
              {formatDate(listing.period_start)} → {formatDate(listing.period_end)}
            </div>
          </div>
          <div className="meta-chip">
            <div className="meta-chip-label">Détail</div>
            <div className="meta-chip-value">{listing.schedule_detail || "—"}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default SwipeCard;
