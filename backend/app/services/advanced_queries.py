"""
Advanced SQL Queries — Interactive Terminal CLI
================================================
Run:  python -m app.services.advanced_queries

Demonstrates raw SQL with advanced PostgreSQL features:
  • Multi-table JOINs, GROUP BY, HAVING, aggregates
  • Parameterised DML (UPDATE with dynamic surge)
  • Window functions (RANK, LAG, moving averages)
  • CTEs (WITH clauses) and sub-queries
"""

import os
import sys
import textwrap

import psycopg2
import psycopg2.extras
from dotenv import load_dotenv

# Try importing tabulate; fall back to a simple printer if missing
try:
    from tabulate import tabulate
except ImportError:
    print("\033[93m[!] 'tabulate' not installed. Run: pip install tabulate\033[0m")
    sys.exit(1)


# ── ANSI colour helpers ────────────────────────────────────────────────────────
BOLD   = "\033[1m"
GREEN  = "\033[92m"
BLUE   = "\033[94m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
RESET  = "\033[0m"


def colour(text: str, code: str) -> str:
    return f"{code}{text}{RESET}"


def header(title: str) -> None:
    width = 60
    print()
    print(colour("═" * width, CYAN))
    print(colour(f"  {title}".center(width), BOLD + CYAN))
    print(colour("═" * width, CYAN))
    print()


def sql_box(sql: str) -> None:
    """Print a SQL query inside a simple ASCII box."""
    lines = textwrap.dedent(sql).strip().splitlines()
    max_len = max(len(l) for l in lines)
    border = "+" + "-" * (max_len + 2) + "+"
    print(colour(border, YELLOW))
    for line in lines:
        print(colour(f"| {line.ljust(max_len)} |", YELLOW))
    print(colour(border, YELLOW))
    print()


def concepts(tags: list[str]) -> None:
    print(colour("  Advanced SQL concepts used:", BOLD + GREEN))
    for tag in tags:
        print(colour(f"    ✦ {tag}", GREEN))
    print()


def pause() -> None:
    input(colour("\n  Press Enter to return to the menu…", BLUE))


def no_data() -> None:
    print(colour("  ⚠  No data returned. The relevant tables may be empty.", YELLOW))


# ── Database connection ────────────────────────────────────────────────────────

def get_connection():
    load_dotenv()
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print(colour("[ERROR] DATABASE_URL not found in .env", RED))
        sys.exit(1)
    return psycopg2.connect(db_url)


# ── Feature 1: Yearly Profit Report ───────────────────────────────────────────

YEARLY_PROFIT_SQL = """\
SELECT
    h.name                  AS hotel_name,
    EXTRACT(MONTH FROM b.check_in)::INTEGER AS month,
    COUNT(b.id)             AS total_bookings,
    ROUND(SUM(p.amount)::NUMERIC, 2) AS gross_revenue,
    ROUND(SUM(CASE WHEN p.status = 'refunded' THEN p.amount ELSE 0 END)::NUMERIC, 2) AS refunds,
    ROUND(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END)::NUMERIC, 2) AS net_profit
FROM bookings b
    JOIN payments p ON p.booking_id = b.id
    JOIN rooms   r ON r.id = b.room_id
    JOIN hotels  h ON h.id = r.hotel_id
WHERE EXTRACT(YEAR FROM b.check_in) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY h.name, EXTRACT(MONTH FROM b.check_in)
HAVING SUM(p.amount) > 0
ORDER BY h.name, month
"""


def yearly_profit(conn):
    header("Yearly Profit Report")
    sql_box(YEARLY_PROFIT_SQL)
    concepts([
        "Multi-table JOINs (bookings → payments → rooms → hotels)",
        "Aggregate functions: COUNT, SUM, ROUND",
        "Conditional aggregation: CASE WHEN … THEN … ELSE … END",
        "GROUP BY with HAVING filter",
        "EXTRACT(YEAR / MONTH FROM …)",
    ])
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(YEARLY_PROFIT_SQL)
        rows = cur.fetchall()
    if not rows:
        no_data()
    else:
        print(tabulate(rows, headers="keys", tablefmt="grid", floatfmt=".2f"))
    pause()


# ── Feature 2: Holiday Dynamic Pricing ────────────────────────────────────────

PRICING_PREVIEW_SQL = """\
SELECT
    r.id,
    h.name AS hotel_name,
    r.room_type,
    r.price_per_night AS current_price,
    ROUND((r.price_per_night * (1 + %(surge_pct)s / 100.0))::NUMERIC, 2) AS holiday_price,
    ROUND((r.price_per_night * %(surge_pct)s / 100.0)::NUMERIC, 2)       AS price_increase
FROM rooms r
    JOIN hotels h ON h.id = r.hotel_id
ORDER BY h.name, r.price_per_night
"""

PRICING_APPLY_SQL = """\
UPDATE rooms
SET price_per_night = ROUND((price_per_night * (1 + %(surge_pct)s / 100.0))::NUMERIC, 2)
"""

PRICING_RESET_SQL = """\
UPDATE rooms
SET price_per_night = ROUND((price_per_night / (1 + %(surge_pct)s / 100.0))::NUMERIC, 2)
"""


def holiday_pricing(conn):
    while True:
        header("Holiday Season Dynamic Pricing")
        print(colour("  1. Preview surge pricing", CYAN))
        print(colour("  2. Apply surge pricing", CYAN))
        print(colour("  3. Reset prices (reverse surge)", CYAN))
        print(colour("  4. Back to main menu", CYAN))
        choice = input(colour("\n  Select option [1-4]: ", BOLD)).strip()

        if choice == "1":
            raw = input(colour("  Enter surge percentage (default 25%): ", BLUE)).strip()
            surge = float(raw) if raw else 25.0
            sql_box(PRICING_PREVIEW_SQL)
            concepts([
                "Parameterised queries (%(surge_pct)s)",
                "Arithmetic expressions in SELECT",
                "ROUND with NUMERIC cast",
                "JOIN for hotel name resolution",
            ])
            with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
                cur.execute(PRICING_PREVIEW_SQL, {"surge_pct": surge})
                rows = cur.fetchall()
            if not rows:
                no_data()
            else:
                print(tabulate(rows, headers="keys", tablefmt="grid", floatfmt=".2f"))

        elif choice == "2":
            raw = input(colour("  Enter surge percentage to apply (default 25%): ", BLUE)).strip()
            surge = float(raw) if raw else 25.0
            confirm = input(colour(f"  ⚠  Apply {surge}% surge to ALL rooms? (yes/no): ", RED + BOLD)).strip().lower()
            if confirm == "yes":
                sql_box(PRICING_APPLY_SQL)
                with conn.cursor() as cur:
                    cur.execute(PRICING_APPLY_SQL, {"surge_pct": surge})
                    updated = cur.rowcount
                conn.commit()
                print(colour(f"  ✔  {updated} rooms updated with {surge}% surge.", GREEN + BOLD))
            else:
                print(colour("  Cancelled.", YELLOW))

        elif choice == "3":
            raw = input(colour("  Enter the surge percentage to reverse (default 25%): ", BLUE)).strip()
            surge = float(raw) if raw else 25.0
            confirm = input(colour(f"  ⚠  Reset prices by reversing {surge}% surge? (yes/no): ", RED + BOLD)).strip().lower()
            if confirm == "yes":
                sql_box(PRICING_RESET_SQL)
                with conn.cursor() as cur:
                    cur.execute(PRICING_RESET_SQL, {"surge_pct": surge})
                    updated = cur.rowcount
                conn.commit()
                print(colour(f"  ✔  {updated} rooms reset (reversed {surge}% surge).", GREEN + BOLD))
            else:
                print(colour("  Cancelled.", YELLOW))

        elif choice == "4":
            return
        else:
            print(colour("  Invalid option.", RED))

        pause()


# ── Feature 3: Hotel Revenue Ranking ──────────────────────────────────────────

HOTEL_RANKING_SQL = """\
WITH hotel_stats AS (
    SELECT
        h.id, h.name, h.city, h.star_rating,
        COUNT(DISTINCT b.id) AS total_bookings,
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) AS total_revenue,
        ROUND(AVG(CASE WHEN p.status = 'completed' THEN p.amount END)::NUMERIC, 2)  AS avg_booking_value,
        SUM(r.total_rooms)                        AS total_rooms,
        SUM(r.total_rooms) - SUM(r.available_rooms) AS occupied_rooms
    FROM hotels h
        LEFT JOIN rooms    r ON r.hotel_id = h.id
        LEFT JOIN bookings b ON b.room_id  = r.id AND b.status != 'cancelled'
        LEFT JOIN payments p ON p.booking_id = b.id
    GROUP BY h.id, h.name, h.city, h.star_rating
)
SELECT
    RANK() OVER (ORDER BY total_revenue DESC) AS revenue_rank,
    name, city, star_rating, total_bookings, total_revenue, avg_booking_value,
    ROUND((occupied_rooms::FLOAT / NULLIF(total_rooms, 0) * 100)::NUMERIC, 1) AS occupancy_pct,
    ROUND((total_revenue::FLOAT / NULLIF((SELECT SUM(total_revenue) FROM hotel_stats), 0) * 100)::NUMERIC, 1) AS revenue_share_pct
FROM hotel_stats
ORDER BY revenue_rank
"""


def hotel_ranking(conn):
    header("Hotel Revenue Ranking")
    sql_box(HOTEL_RANKING_SQL)
    concepts([
        "CTE (WITH … AS) for intermediate result set",
        "Window function: RANK() OVER (ORDER BY …)",
        "NULLIF to prevent division by zero",
        "Scalar sub-query inside window expression",
        "COALESCE for NULL handling",
        "LEFT JOINs to include hotels without bookings",
    ])
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(HOTEL_RANKING_SQL)
        rows = cur.fetchall()
    if not rows:
        no_data()
    else:
        print(tabulate(rows, headers="keys", tablefmt="grid", floatfmt=".2f"))
    pause()


# ── Feature 4: Monthly Booking Trends ─────────────────────────────────────────

BOOKING_TRENDS_SQL = """\
WITH monthly_data AS (
    SELECT
        DATE_TRUNC('month', b.check_in)::DATE AS month,
        COUNT(b.id)                            AS bookings,
        COALESCE(SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END), 0) AS revenue
    FROM bookings b
        LEFT JOIN payments p ON p.booking_id = b.id
    WHERE b.status != 'cancelled'
    GROUP BY DATE_TRUNC('month', b.check_in)
),
trend AS (
    SELECT
        month, bookings, revenue,
        LAG(revenue, 1) OVER (ORDER BY month)                                                   AS prev_month_revenue,
        ROUND(AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)::NUMERIC, 2) AS moving_avg_3m,
        SUM(revenue) OVER (ORDER BY month)                                                      AS cumulative_revenue
    FROM monthly_data
)
SELECT
    TO_CHAR(month, 'Mon YYYY') AS period,
    bookings,
    revenue,
    moving_avg_3m,
    cumulative_revenue,
    CASE WHEN prev_month_revenue > 0
        THEN ROUND(((revenue - prev_month_revenue) / prev_month_revenue * 100)::NUMERIC, 1)
        ELSE NULL
    END AS growth_pct
FROM trend
ORDER BY month
"""


def booking_trends(conn):
    header("Monthly Booking Trends")
    sql_box(BOOKING_TRENDS_SQL)
    concepts([
        "CTE chain (monthly_data → trend)",
        "Window function: LAG(revenue, 1) for previous-month lookup",
        "Moving average: AVG() OVER (ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)",
        "Running total: SUM() OVER (ORDER BY month)",
        "DATE_TRUNC and TO_CHAR for date formatting",
        "Conditional CASE for growth calculation",
    ])
    with conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(BOOKING_TRENDS_SQL)
        rows = cur.fetchall()
    if not rows:
        no_data()
    else:
        print(tabulate(rows, headers="keys", tablefmt="grid", floatfmt=".2f"))
    pause()


# ── Main menu ─────────────────────────────────────────────────────────────────

def main():
    conn = get_connection()
    print(colour("\n  Connected to database ✔", GREEN + BOLD))

    menu_items = {
        "1": ("Yearly Profit Report", yearly_profit),
        "2": ("Holiday Season Dynamic Pricing", holiday_pricing),
        "3": ("Hotel Revenue Ranking (Window Functions)", hotel_ranking),
        "4": ("Monthly Booking Trends (Moving Averages)", booking_trends),
        "5": ("Exit", None),
    }

    while True:
        header("Advanced SQL Queries — Main Menu")
        for key, (label, _) in menu_items.items():
            icon = "🚪" if key == "5" else "📊"
            print(colour(f"    {icon}  {key}. {label}", CYAN))
        print()

        choice = input(colour("  Select an option [1-5]: ", BOLD)).strip()

        if choice == "5":
            print(colour("\n  Goodbye! 👋\n", GREEN + BOLD))
            break

        entry = menu_items.get(choice)
        if entry and entry[1]:
            try:
                entry[1](conn)
            except Exception as exc:
                print(colour(f"\n  [ERROR] {exc}", RED))
                pause()
        else:
            print(colour("  Invalid option. Please choose 1-5.", RED))

    conn.close()


if __name__ == "__main__":
    main()
