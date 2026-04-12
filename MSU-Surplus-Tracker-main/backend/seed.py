import psycopg2
import random

# Database connection details 
DB_PARAMS = {
    "dbname": "postgres",
    "user": "postgres",
    "password": "postgres",
    "host": "localhost",
    "port": "5432" 
}

# Your specific MSU Departments
departments = [
    "Bookstore", "Mathematics", "Geosciences","Career Management Center", 
    "Clark Student Center", "Counseling Center", "Dean of Students", 
    "Nursing", "Disability Services", "Global Education Office", 
    "Health Services", "Post Office", "Recreational Sports & Wellness Center", 
    "Residence Life and Housing", "Student Rights and Responsibilities", 
    "Student Leadership and Involvement", "Student Engagement Center", 
    "Computer Science", "Title IX", "University Police"
]

item_pool = {
    "Dell Latitude Laptop": "High-performance workstation with Core i7. Previously assigned to staff in {dept}.",
    "Herman Miller Chair": "Ergonomic office seating, Aeron model. Surplus from {dept} office renovation.",
    "Epson Projector": "4K Ceiling mount unit. Replaced during the {dept} facility upgrade.",
    "Apple iPad Air": "64GB Tablet. Used for student check-ins and mobile processing within {dept}.",
    "Lab Microscope": "Binocular compound optics. Specialized equipment formerly held by {dept}.",
    "Lenovo ThinkPad": "Rugged enterprise laptop. Primary portable unit for {dept} field operations.",
    "Steelcase Desk": "Executive L-shaped desk. Heavy-duty frame, sourced from {dept} admin suite.",
    "HP LaserJet Printer": "Enterprise monochrome printer. High-volume unit decommissioned by {dept}."
}

conditions = ["New", "Good", "Fair", "Poor"]
statuses = ["active", "surplus", "disposed"]

def seed_data():
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()

        print("Cleaning old database entries...")
        cur.execute("TRUNCATE TABLE assets RESTART IDENTITY CASCADE;")

        print("Seeding MSU Surplus Database with Departmental Data...")

        items_list = list(item_pool.keys())

        for _ in range(25):
            # Generates a number between 40000 and 59999
            tag_number = random.randint(40000, 59999)
            asset_tag = str(tag_number) 
            
            # Select Department
            dept = random.choice(departments)
            
            # Select Item and Inject Department into Description
            item_name = random.choice(items_list)
            description = item_pool[item_name].format(dept=dept)
            
            condition = random.choice(conditions)
            status = random.choice(statuses)
            
            # Insert including the location (Department) column
            cur.execute(
                """
                INSERT INTO assets (asset_tag, item_name, description, location, condition, current_status) 
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (asset_tag, item_name, description, dept, condition, status)
            )

        conn.commit()
        cur.close()
        conn.close()
        print("Successfully added 25 professional assets for MSU Departments!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")

if __name__ == "__main__":
    seed_data()
