export const dummyHotels = [
  {
    id: 1,
    name: "The Oberoi Amarvilas",
    city: "Agra",
    state: "Uttar Pradesh",
    price_per_night: 25000,
    star_rating: 5,
    image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
    description: "Located just 600 meters from the Taj Mahal, this luxury hotel offers unrestricted views of the monument.",
    amenities: ["WiFi", "Pool", "Spa", "Gym", "Restaurant"]
  },
  {
    id: 2,
    name: "Taj Lake Palace",
    city: "Udaipur",
    state: "Rajasthan",
    price_per_night: 35000,
    star_rating: 5,
    image_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    description: "A heritage hotel built in 1746, situated in the middle of Lake Pichola.",
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Bar"]
  },
  {
    id: 3,
    name: "The Leela Palace",
    city: "New Delhi",
    state: "Delhi",
    price_per_night: 18000,
    star_rating: 5,
    image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
    description: "Experience modern luxury and royal grandeur in the heart of the capital.",
    amenities: ["WiFi", "Gym", "Spa", "Parking", "AC"]
  }
];

export const dummyRooms = [
  {
    id: 101,
    hotel_id: 1,
    room_type: "Premier Room",
    price_per_night: 25000,
    capacity: 2,
    bed_type: "King",
    available_rooms: 5,
    image_url: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
    description: "Spacious room with a perfect view of the Taj Mahal."
  },
  {
    id: 102,
    hotel_id: 1,
    room_type: "Luxury Suite",
    price_per_night: 45000,
    capacity: 4,
    bed_type: "Double King",
    available_rooms: 2,
    image_url: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    description: "Ultimate luxury suite offering panoramic views."
  }
];

export const dummyBookings = [
  {
    id: 1001,
    hotel_name: "The Oberoi Amarvilas",
    room_type: "Premier Room",
    check_in: "2026-05-10",
    check_out: "2026-05-12",
    total_price: 50000,
    status: "Upcoming"
  },
  {
    id: 1002,
    hotel_name: "Taj Lake Palace",
    room_type: "Royal Suite",
    check_in: "2026-04-15",
    check_out: "2026-04-18",
    total_price: 105000,
    status: "Completed"
  }
];
