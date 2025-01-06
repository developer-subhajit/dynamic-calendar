import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime
import os

def fetch_uk_holidays():
    # URL of the UK government bank holidays page
    url = "https://www.gov.uk/bank-holidays"
    
    try:
        # Fetch the webpage
        response = requests.get(url)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Find the England and Wales table
        tables = soup.find_all('table')
        holidays_by_year = {}
        
        for table in tables:
            # Get the year from the table's caption or previous h2
            year_elem = table.find_previous('h2')
            if not year_elem:
                continue
                
            year_text = year_elem.text.strip()
            if not "bank holidays in England and Wales" in year_text:
                continue
                
            # Extract year from text like "Upcoming bank holidays in England and Wales 2024" or "Past bank holidays in England and Wales 2023"
            year = year_text.split()[-1]
            
            if not year.isdigit():
                continue
                
            holidays = []
            
            # Process each row in the table
            rows = table.find_all('tr')
            for row in rows:
                cols = row.find_all('td')
                if len(cols) >= 2:  # Ensure we have both date and holiday name
                    date_str = cols[0].text.strip()
                    holiday_name = cols[2].text.strip()
                    
                    try:
                        # Parse and format the date
                        date_obj = datetime.strptime(f"{date_str} {year}", "%d %B %Y")
                        formatted_date = date_obj.strftime("%Y-%m-%d")
                        
                        holidays.append({
                            "date": formatted_date,
                            "name": holiday_name
                        })
                    except ValueError as e:
                        print(f"Error parsing date: {date_str} - {e}")
            
            if holidays:
                holidays_by_year[year] = sorted(holidays, key=lambda x: x['date'])
        
        return holidays_by_year
        
    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        return None
    except Exception as e:
        print(f"Error processing data: {e}")
        return None

def update_holidays_json():
    # Create scripts directory if it doesn't exist
    os.makedirs('js', exist_ok=True)
    
    # Fetch holidays
    holidays_data = fetch_uk_holidays()
    
    if not holidays_data:
        print("Failed to fetch holiday data")
        return
    
    # Path to the JSON file
    json_path = 'js/holidays.json'
    
    # Read existing data if file exists
    existing_data = {}
    if os.path.exists(json_path):
        try:
            with open(json_path, 'r') as f:
                existing_data = json.load(f)
        except json.JSONDecodeError:
            print("Error reading existing JSON file")
    
    # Merge existing data with new data
    merged_data = {**existing_data, **holidays_data}
    
    # Sort years
    sorted_data = {str(year): merged_data[str(year)] 
                  for year in sorted(map(int, merged_data.keys()))}
    
    # Write updated data to file
    try:
        with open(json_path, 'w') as f:
            json.dump(sorted_data, f, indent=4)
        print(f"Successfully updated {json_path}")
        print(f"Years included: {', '.join(sorted_data.keys())}")
    except Exception as e:
        print(f"Error writing JSON file: {e}")

if __name__ == "__main__":
    update_holidays_json() 