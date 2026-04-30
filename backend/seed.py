import psycopg2
import random


DB_PARAMS = {
    "dbname": "msu_surplus_db", # Use your specific database name
    "user": "postgres",         # Default superuser
    "password": "postgres",
    "host": "localhost",
    "port": "5432" 
}

# MSU Departments
departments = [
    "Bookstore", "Mathematics", "Geosciences", "Career Management Center", 
    "Clark Student Center", "Counseling Center", "Dean of Students", 
    "Nursing", "Disability Services", "Global Education Office", 
    "Health Services", "Post Office", "Recreational Sports & Wellness Center", 
    "Residence Life and Housing", "Student Rights and Responsibilities", 
    "Student Leadership and Involvement", "Student Engagement Center", 
    "Computer Science", "Title IX", "University Police"
]


item_pool = {
    "Dell Latitude 5420 Laptop": "High-performance workstation with Core i7. Previously assigned to staff in {dept}.",
    "Herman Miller Aeron Chair": "Ergonomic office seating, size B. Surplus from {dept} office renovation.",
    "Epson Home Cinema 4010": "4K Projector unit. Replaced during the {dept} facility upgrade.",
    "Apple iPad Air (5th Gen)": "64GB Wi-Fi Tablet. Used for student check-ins within {dept}.",
    "AmScope B120C Microscope": "Siedentopf Binocular Compound optics. Specialized equipment from {dept}.",
    "Lenovo ThinkPad X1 Carbon": "Rugged enterprise laptop. Primary portable unit for {dept} field operations.",
    "Steelcase Leap V2 Chair": "Premium ergonomic task chair. Heavy-duty frame, sourced from {dept} admin suite.",
    "HP LaserJet Pro M404n": "Enterprise monochrome printer. High-volume unit decommissioned by {dept}."
}

conditions = ["New", "Good", "Fair", "Poor"]
statuses = ["active", "surplus", "disposed"]

def seed_data():
    conn = None
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()

        print("Cleaning old database entries...")
        # RESTART IDENTITY ensures IDs start back at 1
        cur.execute("TRUNCATE TABLE assets RESTART IDENTITY CASCADE;")

        print("Seeding MSU Surplus Database with Realistic AI-Ready Data...")

        items_list = list(item_pool.keys())
        
        # Generate 25 UNIQUE tags upfront to avoid duplicate key errors
        unique_tags = random.sample(range(40000, 59999), 25)

        for i in range(25):
            asset_tag = str(unique_tags[i])
            
            dept = random.choice(departments)
            item_name = random.choice(items_list)
            description = item_pool[item_name].format(dept=dept)
            condition = random.choice(conditions)
            
            
            status = random.choices(statuses, weights=[10, 80, 10], k=1)[0]
            
            cur.execute(
                """
                INSERT INTO assets (asset_tag, item_name, description, location, condition, current_status) 
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (asset_tag, item_name, description, dept, condition, status)
            )

        conn.commit()
        print(f"Successfully added 25 AI-optimized assets across {len(departments)} MSU departments!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
    finally:
        if conn is not None:
            cur.close()
            conn.close()

if __name__ == "__main__":
    seed_data()
