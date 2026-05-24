import sys
import os

# Ensure the app module can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

from sqlalchemy import text
from app.core.database import SessionLocal

def print_separator(title):
    print("\n" + "="*80)
    print(f" {title} ".center(80, "="))
    print("="*80 + "\n")

def run_queries():
    db = SessionLocal()
    try:
        # 1. Total Profit of the Year
        print_separator("ADVANCED QUERY 1: YEARLY PROFIT & REVENUE ANALYSIS")
        sql1 = text("""
            SELECT 
                EXTRACT(YEAR FROM p.created_at)::INTEGER AS year,
                COUNT(b.id) AS total_bookings,
                SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) AS total_revenue,
                SUM(CASE WHEN p.status = 'completed' THEN p.amount * 0.15 ELSE 0 END) AS platform_fee,
                SUM(CASE WHEN p.status = 'refunded' THEN p.amount ELSE 0 END) AS refunds,
                SUM(CASE WHEN p.status = 'completed' THEN p.amount * 0.15 ELSE 0 END) -
                SUM(CASE WHEN p.status = 'refunded' THEN p.amount ELSE 0 END) AS net_profit
            FROM bookings b
            JOIN payments p ON b.id = p.booking_id
            WHERE EXTRACT(YEAR FROM p.created_at) = 2026
            GROUP BY EXTRACT(YEAR FROM p.created_at);
        """)
        result1 = db.execute(sql1).mappings().all()
        print(f"{'Year':<6} | {'Bookings':<10} | {'Total Revenue':<15} | {'Platform Fee':<15} | {'Refunds':<10} | {'Net Profit':<15}")
        print("-" * 80)
        for row in result1:
            print(f"{row['year']:<6} | {row['total_bookings']:<10} | ₹{row['total_revenue']:<14,.2f} | ₹{row['platform_fee']:<14,.2f} | ₹{row['refunds']:<9,.2f} | ₹{row['net_profit']:<14,.2f}")


        # 2. Monthly Booking Trends (Growth & Averages)
        print_separator("ADVANCED QUERY 2: MONTHLY TRENDS (WINDOW FUNCTIONS & CTES)")
        sql2 = text("""
            WITH monthly_data AS (
                SELECT 
                    DATE_TRUNC('month', b.check_in)::DATE AS month,
                    COUNT(b.id) AS bookings,
                    SUM(p.amount) AS revenue
                FROM bookings b
                JOIN payments p ON b.id = p.booking_id
                WHERE p.status = 'completed'
                GROUP BY DATE_TRUNC('month', b.check_in)
            )
            SELECT 
                month,
                bookings,
                revenue,
                ROUND(AVG(revenue) OVER (
                    ORDER BY month 
                    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
                )::NUMERIC, 2) AS three_month_avg,
                SUM(revenue) OVER (ORDER BY month) AS cumulative_revenue,
                ROUND(
                    ((revenue - LAG(revenue) OVER (ORDER BY month)) / 
                    NULLIF(LAG(revenue) OVER (ORDER BY month), 0) * 100)::NUMERIC, 
                2) AS growth_pct
            FROM monthly_data
            ORDER BY month;
        """)
        result2 = db.execute(sql2).mappings().all()
        print(f"{'Month':<12} | {'Bookings':<8} | {'Revenue':<12} | {'3-Month Avg':<12} | {'Cumulative':<12} | {'Growth %'}")
        print("-" * 80)
        for row in result2:
            growth = f"{row['growth_pct']}%" if row['growth_pct'] is not None else "---"
            print(f"{str(row['month']):<12} | {row['bookings']:<8} | ₹{row['revenue']:<11,.2f} | ₹{row['three_month_avg']:<11,.2f} | ₹{row['cumulative_revenue']:<11,.2f} | {growth}")


        # 3. Hotel Revenue Ranking
        print_separator("ADVANCED QUERY 3: HOTEL REVENUE RANKING (DENSE_RANK & JOINS)")
        sql3 = text("""
            WITH hotel_rooms AS (
                SELECT hotel_id, SUM(total_rooms) AS total_rooms
                FROM rooms
                GROUP BY hotel_id
            ),
            hotel_stats AS (
                SELECT 
                    h.id, h.name, h.city, h.star_rating,
                    COUNT(DISTINCT b.id)  AS total_bookings,
                    COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) AS revenue,
                    hr.total_rooms
                FROM hotels h
                JOIN hotel_rooms hr ON hr.hotel_id = h.id
                LEFT JOIN bookings b ON b.room_id IN (SELECT id FROM rooms WHERE hotel_id = h.id)
                LEFT JOIN payments p ON p.booking_id = b.id
                GROUP BY h.id, h.name, h.city, h.star_rating, hr.total_rooms
            )
            SELECT 
                name, city, star_rating,
                total_bookings,
                revenue,
                DENSE_RANK() OVER (ORDER BY revenue DESC) AS rank,
                CASE 
                    WHEN total_bookings = 0 THEN 0.0
                    ELSE ROUND(((total_bookings::NUMERIC / (total_rooms * 30)) * 100)::NUMERIC, 2)
                END AS occupancy_rate
            FROM hotel_stats
            ORDER BY rank;
        """)
        result3 = db.execute(sql3).mappings().all()
        print(f"{'Rank':<4} | {'Hotel Name':<25} | {'City':<10} | {'Stars':<5} | {'Revenue':<12} | {'Occupancy'}")
        print("-" * 80)
        for row in result3:
            print(f"#{row['rank']:<3} | {row['name']:<25} | {row['city']:<10} | {'★'*row['star_rating']:<5} | ₹{row['revenue']:<11,.2f} | {row['occupancy_rate']}%")

        # 4. Holiday Price Surge Preview
        print_separator("ADVANCED QUERY 4: HOLIDAY PRICE SURGE ENGINE (25% SURGE)")
        sql4 = text("""
            SELECT 
                h.name AS hotel_name,
                r.room_type,
                ROUND(r.price_per_night::NUMERIC, 2) AS current_price,
                ROUND((r.base_price * (1 + 25.0 / 100.0))::NUMERIC, 2) AS holiday_price,
                ROUND((r.base_price * (1 + 25.0 / 100.0) - r.price_per_night)::NUMERIC, 2) AS price_increase
            FROM rooms r
            JOIN hotels h ON h.id = r.hotel_id
            ORDER BY h.name, r.price_per_night
            LIMIT 5;
        """)
        result4 = db.execute(sql4).mappings().all()
        print(f"{'Hotel Name':<25} | {'Room Type':<18} | {'Current Price':<14} | {'Holiday Price':<14} | {'Increase'}")
        print("-" * 80)
        for row in result4:
            print(f"{row['hotel_name']:<25} | {row['room_type']:<18} | ₹{row['current_price']:<13,.2f} | ₹{row['holiday_price']:<13,.2f} | +₹{row['price_increase']:<10,.2f}")

        print("\n" + "="*80)
        print(" DEMO COMPLETED SUCCESSFULLY ".center(80, "="))
        print("="*80 + "\n")

    finally:
        db.close()

if __name__ == "__main__":
    run_queries()
