# 🏨 StayLux — Hotel Booking System

A full-stack hotel booking platform built as a DBMS mini-project. StayLux allows users to browse hotels, make room reservations, and manage their bookings — while providing administrators with a powerful dashboard to oversee the entire platform.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion |
| **Backend** | FastAPI (Python), SQLAlchemy ORM |
| **Database** | PostgreSQL |
| **Auth** | JWT (JSON Web Tokens) via `python-jose` |
| **Payments** | Simulated payment flow with transaction ID generation |

---

## ✨ Features

### 👤 User-Facing
- Browse & search hotels with images, ratings, and amenities
- View detailed hotel pages with available room types
- Book rooms with check-in/check-out dates, guest count & special requests
- Simulated payment on checkout (credit card / UPI / net banking)
- User Dashboard — view all past and upcoming bookings
- Cancel reservations (restores room availability + marks payment as refunded)
- Update profile name and phone number

### 🛡️ Admin Dashboard
- Secure admin-only portal (`/admin`)
- Real-time stats — Total Bookings, Revenue, Occupancy Rate, Total Hotels
- Recent Bookings feed shown directly on the Dashboard
- Manage all Bookings across all users with rich cards (hotel image, user info, dates, amount, status)
- Cancel any user's booking from the admin panel — instantly reflects on the user's dashboard
- View all Hotels and Rooms across the platform
- Premium animated confirmation dialog before cancellation

### 🔐 Authentication & Security
- JWT-based auth with token expiry
- Role-based access control — admins and regular users are strictly separated
- Admin cannot book hotels (enforced on the frontend with a premium info banner)
- Admin link in navbar only shows for admin users; regular users see their Dashboard link

---

## 🗂️ Project Structure

```
dbms/
├── backend/
│   ├── app/
│   │   ├── core/           # DB connection, security (JWT), config
│   │   ├── models/         # SQLAlchemy models (User, Hotel, Room, Booking, Payment, Review)
│   │   ├── routers/        # API route handlers (auth, hotels, rooms, bookings, admin)
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Seed script for initial data
│   │   └── main.py         # FastAPI app entry point
│   ├── alembic/            # Database migrations
│   └── .env                # Environment variables (DB URL, secret key)
│
└── frontend/
    └── src/
        ├── api/            # Axios instance with base URL
        ├── components/     # Navbar (shared layout)
        ├── context/        # AuthContext (global user state)
        ├── pages/          # All page components
        │   ├── HomePage.jsx
        │   ├── SearchPage.jsx
        │   ├── HotelDetailPage.jsx
        │   ├── BookingPage.jsx
        │   ├── DashboardPage.jsx   # User dashboard
        │   ├── AdminPage.jsx       # Admin portal
        │   ├── LoginPage.jsx
        │   └── RegisterPage.jsx
        └── App.jsx         # Routes & protected route logic
```

---

## 🗄️ Database Schema

| Table | Key Columns |
|---|---|
| `users` | id, name, email, hashed_password, phone, is_admin |
| `hotels` | id, name, location, description, rating, amenities, image_url |
| `rooms` | id, hotel_id, room_type, price_per_night, capacity, total_rooms, available_rooms |
| `bookings` | id, user_id, room_id, check_in, check_out, guests, total_price, status |
| `payments` | id, booking_id, amount, payment_method, transaction_id, status |
| `reviews` | id, user_id, hotel_id, rating, comment |

---

## ⚙️ Local Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL running locally

### 1. Clone the Repository
```bash
git clone https://github.com/Halcyonic-01/dbms_aat.git
cd dbms_aat
```

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/hotel_booking
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

Create the PostgreSQL database and seed it:
```bash
# Create the DB
psql -U postgres -c "CREATE DATABASE hotel_booking;"

# Run migrations
alembic upgrade head

# Seed initial data (hotels, rooms, admin account)
python -m app.services.seed
```

Start the backend server:
```bash
uvicorn app.main:app --reload
```
> API will be available at `http://localhost:8000`
> Interactive API docs at `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```
> App will be available at `http://localhost:5173` (or `5174`)

---

## 🔑 Default Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@hotelbooking.com` | `admin123` |
| **Test User** | `kushagra@test.com` | `test123` |

> **Note:** These are seeded automatically by `app.services.seed`. To reset the database to a clean state, run:
> ```bash
> psql -d hotel_booking -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
> alembic upgrade head
> python -m app.services.seed
> ```

---

## 📡 Key API Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Login & receive JWT token | Public |
| `GET` | `/api/hotels/` | List all hotels | Public |
| `GET` | `/api/hotels/{id}` | Hotel details + rooms | Public |
| `POST` | `/api/bookings/` | Create a booking | User |
| `GET` | `/api/bookings/my` | Get current user's bookings | User |
| `PUT` | `/api/bookings/{id}/cancel` | Cancel a booking | User / Admin |
| `GET` | `/api/bookings/all` | All bookings (platform-wide) | Admin |
| `GET` | `/api/rooms/all` | All rooms (platform-wide) | Admin |
| `GET` | `/api/admin/stats` | Dashboard statistics | Admin |

---

## 🧩 Core Concepts Demonstrated

- **Relational Database Design** — Foreign keys, JOINs, constraints across 6 related tables
- **ORM** — SQLAlchemy models with relationships (`relationship()`, `joinedload`)
- **REST API Design** — Resource-based routes, proper HTTP methods and status codes
- **Authentication** — Stateless JWT flow with role-based guards (`get_current_user`, `get_current_admin`)
- **Data Integrity** — Room availability counter decremented on booking, restored on cancellation
- **Aggregation Queries** — Revenue, occupancy rate, booking counts using SQL aggregate functions

---

## 👨‍💻 Author

**Kushagra Singh**
*DBMS Mini Project — 2026*
