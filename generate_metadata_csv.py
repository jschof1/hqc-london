import json
import csv
import re

# Load area data
with open('src/data/area-data.json', 'r') as f:
    area_data = json.load(f)

# Define output CSV
csv_file = 'metadata_update.csv'

# SEO Formulas
def generate_new_title(area_name):
    return f"Domestic Cleaners {area_name} | Premium House Cleaning"

def generate_new_description(area_name, postcodes):
    postcode_str = ', '.join(postcodes)
    return f"Top-rated domestic cleaners in {area_name}. We provide high-end weekly housekeeping, deep cleaning, and ironing. Book your local cleaner today."

# Write to CSV
with open(csv_file, 'w', newline='') as f:
    writer = csv.writer(f)
    writer.writerow(['url', 'old_title', 'new_title', 'new_meta_description'])

    for key, data in area_data.items():
        # Convert CamelCase to kebab-case
        slug = re.sub(r'(?<!^)(?=[A-Z])', '-', key).lower()
        url = f"highqualityclean.co.uk/locations/london/{slug}/"
        
        old_title = data.get('pageTitle', '')
        new_title = generate_new_title(data['name'])
        new_desc = generate_new_description(data['name'], data['postcodes'])
        
        writer.writerow([url, old_title, new_title, new_desc])

print(f"Generated {csv_file}")
