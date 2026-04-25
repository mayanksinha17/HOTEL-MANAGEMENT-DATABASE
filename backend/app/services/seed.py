"""
Seed script — populates the database with sample hotels, rooms, and an admin user.
Run this once after setting up the database:
    cd backend && source venv/bin/activate && python -m app.services.seed
"""

import sys
import os

# Add parent directory to path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User
from app.models.hotel import Hotel
from app.models.room import Room


def seed_database():
    """Populate database with sample data."""
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if data already exists
        if db.query(User).first():
            print("⚠️  Database already seeded. Skipping.")
            return

        print("🌱 Seeding database...")

        # --- Create Admin User ---
        admin = User(
            name="Admin",
            email="admin@hotelbooking.com",
            phone="+91-9876543210",
            hashed_password=hash_password("admin123"),
            is_admin=True,
        )
        db.add(admin)

        # --- Create Test User ---
        test_user = User(
            name="Kushagra Singh",
            email="kushagra@test.com",
            phone="+91-9876543211",
            hashed_password=hash_password("test123"),
            is_admin=False,
        )
        db.add(test_user)

        db.flush()

        # --- Create Hotels ---
        hotels_data = [
            {
                "name": "The Grand Imperial",
                "description": "Experience unparalleled luxury at The Grand Imperial, where every detail is crafted to perfection. Nestled in the heart of Mumbai, our hotel offers breathtaking views of the Arabian Sea, world-class dining, and an oasis of tranquility amidst the bustling city.",
                "address": "Marine Drive, Nariman Point",
                "city": "Mumbai",
                "state": "Maharashtra",
                "country": "India",
                "star_rating": 5,
                "price_per_night": 12500.0,
                "image_url": "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
                "amenities": ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar", "Parking", "AC", "Room Service", "Concierge"],
            },
            {
                "name": "Royal Heritage Palace",
                "description": "Step into a world of regal elegance at the Royal Heritage Palace. This heritage property seamlessly blends Rajasthani architecture with modern comforts, offering guests an authentic royal experience with contemporary amenities.",
                "address": "Palace Road, Civil Lines",
                "city": "Jaipur",
                "state": "Rajasthan",
                "country": "India",
                "star_rating": 5,
                "price_per_night": 15000.0,
                "image_url": "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80",
                "amenities": ["WiFi", "Pool", "Spa", "Gym", "Restaurant", "Heritage Tours", "Parking", "AC", "Room Service"],
            },
            {
                "name": "Skyline Business Hotel",
                "description": "The perfect blend of business and leisure. Skyline Business Hotel offers state-of-the-art conference facilities, high-speed connectivity, and a rooftop lounge with panoramic city views. Ideal for the modern business traveler.",
                "address": "MG Road, Sector 28",
                "city": "Gurugram",
                "state": "Haryana",
                "country": "India",
                "star_rating": 4,
                "price_per_night": 6500.0,
                "image_url": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
                "amenities": ["WiFi", "Gym", "Restaurant", "Conference Room", "Parking", "AC", "Business Center", "Laundry"],
            },
            {
                "name": "Seaside Retreat",
                "description": "Wake up to the sound of waves at Seaside Retreat. Our beachfront property in Goa offers a perfect escape with private beach access, infinity pool, Ayurvedic spa, and fresh seafood at our award-winning restaurant.",
                "address": "Baga Beach Road",
                "city": "Goa",
                "state": "Goa",
                "country": "India",
                "star_rating": 4,
                "price_per_night": 8500.0,
                "image_url": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
                "amenities": ["WiFi", "Pool", "Beach Access", "Spa", "Restaurant", "Bar", "Water Sports", "AC", "Room Service"],
            },
            {
                "name": "Mountain View Lodge",
                "description": "Perched in the foothills of the Himalayas, Mountain View Lodge offers a serene escape from city life. Enjoy cozy rooms with mountain views, trekking trails, bonfire evenings, and authentic Himalayan cuisine.",
                "address": "Mall Road",
                "city": "Manali",
                "state": "Himachal Pradesh",
                "country": "India",
                "star_rating": 3,
                "price_per_night": 4500.0,
                "image_url": "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80",
                "amenities": ["WiFi", "Restaurant", "Bonfire", "Trekking", "Parking", "Room Service", "Mountain View"],
            },
            {
                "name": "Urban Comfort Suites",
                "description": "Modern, affordable, and centrally located. Urban Comfort Suites is perfect for travelers who want quality accommodation without breaking the bank. Located near major attractions and transit hubs in Delhi.",
                "address": "Connaught Place",
                "city": "Delhi",
                "state": "Delhi",
                "country": "India",
                "star_rating": 3,
                "price_per_night": 3500.0,
                "image_url": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
                "amenities": ["WiFi", "AC", "Restaurant", "Laundry", "Parking", "24/7 Front Desk"],
            },
        ]

        hotels = []
        for h_data in hotels_data:
            hotel = Hotel(**h_data)
            db.add(hotel)
            hotels.append(hotel)

        db.flush()

        # --- Create Rooms for Each Hotel ---
        room_templates = [
            # Hotel 0: The Grand Imperial (Mumbai)
            [
                {"room_type": "Deluxe Room", "description": "Spacious room with sea view, king-size bed, and premium amenities.", "price_per_night": 12500.0, "capacity": 2, "bed_type": "King", "total_rooms": 20, "available_rooms": 15, "image_url": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80"},
                {"room_type": "Executive Suite", "description": "Luxury suite with living area, sea-facing balcony, and butler service.", "price_per_night": 22000.0, "capacity": 3, "bed_type": "King", "total_rooms": 10, "available_rooms": 7, "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80"},
                {"room_type": "Presidential Suite", "description": "The pinnacle of luxury — private terrace, jacuzzi, dining room, and panoramic ocean views.", "price_per_night": 45000.0, "capacity": 4, "bed_type": "King", "total_rooms": 2, "available_rooms": 2, "image_url": "https://images.unsplash.com/photo-1590490360182-c33d82de0e5c?w=600&q=80"},
            ],
            # Hotel 1: Royal Heritage Palace (Jaipur)
            [
                {"room_type": "Heritage Room", "description": "Elegantly decorated room with traditional Rajasthani art and modern comforts.", "price_per_night": 15000.0, "capacity": 2, "bed_type": "Double", "total_rooms": 15, "available_rooms": 10, "image_url": "https://images.unsplash.com/photo-1590490360182-c33d82de0e5c?w=600&q=80"},
                {"room_type": "Royal Suite", "description": "Live like royalty in our opulent suite with hand-painted murals and private courtyard.", "price_per_night": 28000.0, "capacity": 3, "bed_type": "King", "total_rooms": 8, "available_rooms": 5, "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80"},
                {"room_type": "Maharaja Suite", "description": "The ultimate royal experience — antique furnishings, private pool, and dedicated staff.", "price_per_night": 55000.0, "capacity": 4, "bed_type": "King", "total_rooms": 2, "available_rooms": 2, "image_url": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80"},
            ],
            # Hotel 2: Skyline Business Hotel (Gurugram)
            [
                {"room_type": "Standard Room", "description": "Comfortable room with work desk, high-speed WiFi, and city view.", "price_per_night": 6500.0, "capacity": 2, "bed_type": "Double", "total_rooms": 30, "available_rooms": 22, "image_url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"},
                {"room_type": "Business Suite", "description": "Spacious suite with separate meeting area, premium amenities, and lounge access.", "price_per_night": 11000.0, "capacity": 2, "bed_type": "King", "total_rooms": 15, "available_rooms": 10, "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80"},
            ],
            # Hotel 3: Seaside Retreat (Goa)
            [
                {"room_type": "Beach View Room", "description": "Wake up to stunning ocean views from your private balcony.", "price_per_night": 8500.0, "capacity": 2, "bed_type": "Double", "total_rooms": 20, "available_rooms": 12, "image_url": "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600&q=80"},
                {"room_type": "Pool Villa", "description": "Private villa with plunge pool, garden, and direct beach access.", "price_per_night": 18000.0, "capacity": 4, "bed_type": "King", "total_rooms": 6, "available_rooms": 4, "image_url": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80"},
            ],
            # Hotel 4: Mountain View Lodge (Manali)
            [
                {"room_type": "Mountain Room", "description": "Cozy room with stunning Himalayan views and a warm fireplace.", "price_per_night": 4500.0, "capacity": 2, "bed_type": "Double", "total_rooms": 12, "available_rooms": 8, "image_url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"},
                {"room_type": "Family Cottage", "description": "Spacious wooden cottage perfect for families, with mountain views and a kitchenette.", "price_per_night": 7500.0, "capacity": 5, "bed_type": "Double", "total_rooms": 5, "available_rooms": 3, "image_url": "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80"},
            ],
            # Hotel 5: Urban Comfort Suites (Delhi)
            [
                {"room_type": "Standard Room", "description": "Clean, comfortable room with all essentials for a pleasant stay.", "price_per_night": 3500.0, "capacity": 2, "bed_type": "Double", "total_rooms": 25, "available_rooms": 18, "image_url": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"},
                {"room_type": "Deluxe Room", "description": "Upgraded room with extra space, minibar, and city views.", "price_per_night": 5500.0, "capacity": 3, "bed_type": "King", "total_rooms": 10, "available_rooms": 7, "image_url": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80"},
            ],
        ]

        for i, hotel in enumerate(hotels):
            for room_data in room_templates[i]:
                room = Room(hotel_id=hotel.id, **room_data)
                db.add(room)

        db.commit()
        print("✅ Database seeded successfully!")
        print(f"   → {len(hotels)} hotels created")
        print(f"   → Admin login: admin@hotelbooking.com / admin123")
        print(f"   → Test user: kushagra@test.com / test123")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
