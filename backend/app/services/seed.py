"""
Seed script — populates the database with sample hotels, rooms, and an admin user.
Also creates dummy bookings, payments, and reviews for demo/testing.
Run this once after setting up the database:
    cd backend && source venv/bin/activate && python -m app.services.seed
"""

import sys
import os
import uuid
from datetime import date

# Add parent directory to path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from app.core.database import SessionLocal, engine, Base
from app.core.security import hash_password
from app.models.user import User
from app.models.hotel import Hotel
from app.models.room import Room
from app.models.booking import Booking
from app.models.payment import Payment
from app.models.review import Review


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

        # Collect all room objects into a flat list for easy referencing
        all_rooms = []
        for i, hotel in enumerate(hotels):
            for room_data in room_templates[i]:
                room_data["base_price"] = room_data["price_per_night"]
                room = Room(hotel_id=hotel.id, **room_data)
                db.add(room)
                all_rooms.append(room)

        db.flush()  # Flush to get room IDs before creating bookings

        # =====================================================================
        # --- Create 5 Extra Users (realistic Indian names) ---
        # =====================================================================
        extra_users_data = [
            {"name": "Rahul Sharma",  "email": "rahul@test.com",  "phone": "+91-9876543212"},
            {"name": "Priya Patel",   "email": "priya@test.com",  "phone": "+91-9876543213"},
            {"name": "Amit Kumar",    "email": "amit@test.com",   "phone": "+91-9876543214"},
            {"name": "Neha Gupta",    "email": "neha@test.com",   "phone": "+91-9876543215"},
            {"name": "Vikram Singh",  "email": "vikram@test.com", "phone": "+91-9876543216"},
        ]
        extra_users = []
        for u_data in extra_users_data:
            user = User(
                name=u_data["name"],
                email=u_data["email"],
                phone=u_data["phone"],
                hashed_password=hash_password("test123"),
                is_admin=False,
            )
            db.add(user)
            extra_users.append(user)

        db.flush()  # Flush to get user IDs

        # All bookable users: test_user + 5 extra users
        all_users = [test_user] + extra_users

        # =====================================================================
        # --- Create ~30 Bookings (Jan–May 2026) ---
        # =====================================================================
        # Room index mapping (flat list order):
        #   0-2:  Grand Imperial (Mumbai)     — Deluxe, Executive Suite, Presidential
        #   3-5:  Royal Heritage (Jaipur)      — Heritage, Royal Suite, Maharaja
        #   6-7:  Skyline Business (Gurugram)  — Standard, Business Suite
        #   8-9:  Seaside Retreat (Goa)        — Beach View, Pool Villa
        #  10-11: Mountain View (Manali)       — Mountain Room, Family Cottage
        #  12-13: Urban Comfort (Delhi)        — Standard, Deluxe

        bookings_data = [
            # --- 20 COMPLETED bookings ---
            # user_idx, room_idx, check_in, check_out, guests, status, special_requests
            (0, 0,  date(2026, 1, 5),  date(2026, 1, 8),  2, "completed", "Late check-in requested"),
            (1, 3,  date(2026, 1, 10), date(2026, 1, 14), 2, "completed", "Heritage tour on day 2 please"),
            (2, 6,  date(2026, 1, 15), date(2026, 1, 17), 1, "completed", "Need early morning wake-up call"),
            (3, 8,  date(2026, 1, 20), date(2026, 1, 25), 2, "completed", "Anniversary celebration — cake please"),
            (4, 10, date(2026, 1, 22), date(2026, 1, 26), 2, "completed", "Interested in trekking packages"),
            (5, 12, date(2026, 2, 1),  date(2026, 2, 3),  1, "completed", None),
            (0, 4,  date(2026, 2, 5),  date(2026, 2, 8),  3, "completed", "Vegetarian meals only"),
            (1, 1,  date(2026, 2, 10), date(2026, 2, 13), 2, "completed", "Sea-facing room preferred"),
            (2, 9,  date(2026, 2, 14), date(2026, 2, 18), 4, "completed", "Honeymoon trip — rose petals setup"),
            (3, 7,  date(2026, 2, 20), date(2026, 2, 22), 2, "completed", "Need meeting room for 2 hours"),
            (4, 13, date(2026, 3, 1),  date(2026, 3, 4),  2, "completed", None),
            (5, 2,  date(2026, 3, 5),  date(2026, 3, 7),  2, "completed", "Birthday celebration"),
            (0, 11, date(2026, 3, 10), date(2026, 3, 15), 4, "completed", "Family vacation — need extra blankets"),
            (1, 5,  date(2026, 3, 12), date(2026, 3, 14), 2, "completed", "Private pool access required"),
            (2, 0,  date(2026, 3, 18), date(2026, 3, 21), 2, "completed", None),
            (3, 12, date(2026, 3, 25), date(2026, 3, 28), 1, "completed", "Near metro station room preferred"),
            (4, 3,  date(2026, 4, 1),  date(2026, 4, 4),  2, "completed", "Want to visit Amber Fort"),
            (5, 8,  date(2026, 4, 5),  date(2026, 4, 9),  2, "completed", "Beach-facing room"),
            (0, 6,  date(2026, 4, 10), date(2026, 4, 12), 1, "completed", "Business trip — need fast WiFi"),
            (1, 10, date(2026, 4, 15), date(2026, 4, 19), 2, "completed", "Bonfire arrangement on last evening"),

            # --- 5 CONFIRMED bookings (upcoming) ---
            (2, 1,  date(2026, 5, 1),  date(2026, 5, 4),  2, "confirmed", "Airport pickup needed"),
            (3, 9,  date(2026, 5, 5),  date(2026, 5, 8),  3, "confirmed", "Pool villa with garden view"),
            (4, 0,  date(2026, 5, 10), date(2026, 5, 13), 2, "confirmed", None),
            (5, 11, date(2026, 5, 15), date(2026, 5, 20), 5, "confirmed", "Family reunion — adjoining rooms if possible"),
            (0, 3,  date(2026, 5, 18), date(2026, 5, 22), 2, "confirmed", "Heritage room with balcony"),

            # --- 5 CANCELLED bookings ---
            (1, 6,  date(2026, 2, 25), date(2026, 2, 28), 1, "cancelled", "Plans changed"),
            (2, 12, date(2026, 3, 1),  date(2026, 3, 3),  2, "cancelled", None),
            (3, 4,  date(2026, 3, 15), date(2026, 3, 18), 3, "cancelled", "Flight cancelled"),
            (4, 8,  date(2026, 4, 1),  date(2026, 4, 5),  2, "cancelled", "Medical emergency"),
            (5, 10, date(2026, 4, 10), date(2026, 4, 13), 2, "cancelled", "Rescheduling to next month"),
        ]

        bookings = []
        for user_idx, room_idx, ci, co, guests, status, special_req in bookings_data:
            num_nights = (co - ci).days
            total = num_nights * all_rooms[room_idx].price_per_night
            booking = Booking(
                user_id=all_users[user_idx].id,
                room_id=all_rooms[room_idx].id,
                check_in=ci,
                check_out=co,
                guests=guests,
                total_price=total,
                status=status,
                special_requests=special_req,
            )
            db.add(booking)
            bookings.append(booking)

        db.flush()  # Flush to get booking IDs

        # =====================================================================
        # --- Create Payments (one per booking) ---
        # =====================================================================
        payment_methods = ["credit_card", "debit_card", "upi", "net_banking"]
        payments = []
        for i, booking in enumerate(bookings):
            pay_status = "refunded" if booking.status == "cancelled" else "completed"
            payment = Payment(
                booking_id=booking.id,
                amount=booking.total_price,
                payment_method=payment_methods[i % len(payment_methods)],
                transaction_id=f"TXN-SEED-{i:04d}",
                status=pay_status,
            )
            db.add(payment)
            payments.append(payment)

        # =====================================================================
        # --- Create Reviews (from completed bookings only) ---
        # =====================================================================
        review_comments = [
            "Amazing stay! The room was spotless and staff was very helpful. Will definitely come back.",
            "Beautiful heritage property. Felt like stepping back in time. Breakfast buffet was outstanding.",
            "Good value for money. Clean rooms and convenient location near the business district.",
            "Waking up to the sound of waves was magical. The seafood at the restaurant was incredible.",
            "Perfect mountain getaway! The bonfire evening was the highlight. Cozy rooms with great views.",
            "Decent hotel for a budget stay in Delhi. Close to Connaught Place and metro.",
            "The suite was jaw-dropping — private balcony with sea view. Top-notch service throughout.",
            "Rajasthani hospitality at its finest. The heritage tour was well organized.",
            "Pool villa was paradise! Kids loved the private plunge pool. Family-friendly staff.",
            "Great business hotel. Conference facilities were modern and well-equipped.",
            "The Himalayan views from our cottage were breathtaking. Trekking trails were well-maintained.",
            "Excellent location in the heart of Mumbai. Rooftop restaurant had stunning city views.",
            "Romantic getaway in Goa was perfect. Beach access and spa were highlights.",
            "Staff went above and beyond for our anniversary celebration. Truly memorable experience.",
            "Clean, comfortable, and affordable. Everything a business traveler needs.",
        ]

        # Ratings: mostly 4s and 5s, a few 3s for variety
        review_ratings = [5, 5, 4, 5, 4, 3, 5, 5, 4, 4, 5, 4, 5, 5, 3]

        # We review completed bookings only; respect UniqueConstraint(user_id, hotel_id)
        reviewed_pairs = set()  # Track (user_id, hotel_id) to avoid duplicates
        reviews = []
        completed_bookings = [b for b in bookings if b.status == "completed"]

        review_idx = 0
        for booking in completed_bookings:
            if review_idx >= 15:
                break
            # Get the hotel_id via the room
            room = all_rooms[next(
                ri for ri, r in enumerate(all_rooms) if r.id == booking.room_id
            )]
            pair = (booking.user_id, room.hotel_id)
            if pair in reviewed_pairs:
                continue  # Skip duplicate user-hotel pair
            reviewed_pairs.add(pair)

            review = Review(
                user_id=booking.user_id,
                hotel_id=room.hotel_id,
                rating=review_ratings[review_idx],
                comment=review_comments[review_idx],
            )
            db.add(review)
            reviews.append(review)
            review_idx += 1

        # =====================================================================
        # --- Commit everything ---
        # =====================================================================
        db.commit()

        print("✅ Database seeded successfully!")
        print(f"   → {len(hotels)} hotels created")
        print(f"   → {len(all_rooms)} rooms created")
        print(f"   → {len(all_users) + 1} users created (1 admin + {len(all_users)} regular)")
        print(f"   → {len(bookings)} bookings created")
        print(f"   → {len(payments)} payments created")
        print(f"   → {len(reviews)} reviews created")
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
