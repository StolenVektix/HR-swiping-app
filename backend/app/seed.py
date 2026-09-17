from datetime import date

from .auth import hash_password
from .database import Base, SessionLocal, engine
from .models import EmployerProfile, Listing, Location, PayUnit, Role, ScheduleType, User, WorkerProfile


def run():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        bordeaux_employer_user = User(
            email="employeur.bordeaux@demo.fr",
            password_hash=hash_password("demo1234"),
            role=Role.EMPLOYER,
        )
        paris_employer_user = User(
            email="employeur.paris@demo.fr",
            password_hash=hash_password("demo1234"),
            role=Role.EMPLOYER,
        )
        worker_user = User(
            email="interimaire@demo.fr",
            password_hash=hash_password("demo1234"),
            role=Role.WORKER,
        )
        db.add_all([bordeaux_employer_user, paris_employer_user, worker_user])
        db.flush()

        bordeaux_employer = EmployerProfile(
            user_id=bordeaux_employer_user.id,
            company_name="Vignobles & Co",
            description="Domaine viticole familial près de Bordeaux, spécialisé dans les vins primeurs.",
        )
        paris_employer = EmployerProfile(
            user_id=paris_employer_user.id,
            company_name="Brasserie Le Central",
            description="Brasserie parisienne animée, service midi et soir, ambiance conviviale.",
        )
        worker_profile = WorkerProfile(
            user_id=worker_user.id,
            full_name="Camille Dupont",
            phone="06 12 34 56 78",
            bio="Polyvalente, disponible rapidement, expérience en restauration et logistique.",
        )
        db.add_all([bordeaux_employer, paris_employer, worker_profile])
        db.flush()

        listings = [
            Listing(
                employer_id=bordeaux_employer.id,
                title="Vendangeur / Vendangeuse",
                description="Récolte manuelle du raisin sur nos parcelles. Repas fournis, hébergement possible.",
                pay_amount=12.5,
                pay_unit=PayUnit.HOUR,
                schedule_type=ScheduleType.FULL_TIME,
                schedule_detail="35h/semaine, du lundi au samedi",
                period_start=date(2026, 9, 20),
                period_end=date(2026, 10, 5),
                location=Location.BORDEAUX,
            ),
            Listing(
                employer_id=bordeaux_employer.id,
                title="Agent de conditionnement",
                description="Mise en bouteille et étiquetage sur ligne semi-automatisée.",
                pay_amount=11.8,
                pay_unit=PayUnit.HOUR,
                schedule_type=ScheduleType.PART_TIME,
                schedule_detail="20h/semaine",
                period_start=date(2026, 10, 1),
                period_end=date(2026, 11, 15),
                location=Location.BORDEAUX,
            ),
            Listing(
                employer_id=bordeaux_employer.id,
                title="Chauffeur livreur permis B",
                description="Livraison de commandes chez les cavistes de la métropole bordelaise.",
                pay_amount=110,
                pay_unit=PayUnit.DAY,
                schedule_type=ScheduleType.FULL_TIME,
                schedule_detail="35h/semaine",
                period_start=date(2026, 9, 22),
                period_end=date(2026, 12, 20),
                location=Location.BORDEAUX,
            ),
            Listing(
                employer_id=paris_employer.id,
                title="Serveur / Serveuse en salle",
                description="Service en salle midi et soir, équipe dynamique, pourboires inclus.",
                pay_amount=13.2,
                pay_unit=PayUnit.HOUR,
                schedule_type=ScheduleType.FULL_TIME,
                schedule_detail="39h/semaine, coupures possibles",
                period_start=date(2026, 9, 18),
                period_end=date(2026, 12, 31),
                location=Location.PARIS,
            ),
            Listing(
                employer_id=paris_employer.id,
                title="Plongeur / Plongeuse",
                description="Nettoyage vaisselle et plonge, service du soir uniquement.",
                pay_amount=12.0,
                pay_unit=PayUnit.HOUR,
                schedule_type=ScheduleType.PART_TIME,
                schedule_detail="15h/semaine, soirs uniquement",
                period_start=date(2026, 9, 20),
                period_end=date(2026, 10, 31),
                location=Location.PARIS,
            ),
            Listing(
                employer_id=paris_employer.id,
                title="Renfort événementiel",
                description="Mission courte pour un événement d'entreprise (installation, accueil, service).",
                pay_amount=350,
                pay_unit=PayUnit.MISSION,
                schedule_type=ScheduleType.FULL_TIME,
                schedule_detail="2 jours",
                period_start=date(2026, 10, 3),
                period_end=date(2026, 10, 4),
                location=Location.PARIS,
            ),
            Listing(
                employer_id=paris_employer.id,
                title="Hôte / Hôtesse d'accueil",
                description="Accueil clientèle et gestion des réservations pour un restaurant haut de gamme.",
                pay_amount=13.8,
                pay_unit=PayUnit.HOUR,
                schedule_type=ScheduleType.PART_TIME,
                schedule_detail="24h/semaine",
                period_start=date(2026, 9, 25),
                period_end=date(2026, 11, 30),
                location=Location.PARIS,
            ),
        ]
        db.add_all(listings)
        db.commit()

        print("Base de données initialisée avec les comptes de démonstration :")
        print("  Employeur Bordeaux : employeur.bordeaux@demo.fr / demo1234")
        print("  Employeur Paris    : employeur.paris@demo.fr / demo1234")
        print("  Intérimaire        : interimaire@demo.fr / demo1234")
    finally:
        db.close()


if __name__ == "__main__":
    run()
