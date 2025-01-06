import json
import os
from datetime import datetime

import requests
from bs4 import BeautifulSoup


def fetch_uk_holidays():
    # URL of the UK government bank holidays page (England and Wales section)
    url = "https://www.gov.uk/bank-holidays#england-and-wales"

    try:
        # Fetch the webpage
        print("Fetching data from", url)
        response = requests.get(url)
        response.raise_for_status()

        # Parse HTML
        soup = BeautifulSoup(response.text, "html.parser")
        print("HTML fetched successfully")

        # Find the England and Wales section
        england_wales_section = soup.find(
            lambda tag: tag.name in ["div", "section"] and "England and Wales" in tag.text
        )
        if not england_wales_section:
            print("England and Wales section not found")
            return None

        print("\nFound England and Wales section")

        # Find all tables in the England and Wales section
        tables = england_wales_section.find_all("table")
        print(f"Found {len(tables)} tables in England and Wales section")

        holidays_by_year = {}

        # Process each table
        for table_index, table in enumerate(tables, 1):
            # Get the caption text
            caption = table.find("caption")
            if not caption:
                print(f"\nTable {table_index}: No caption found")
                continue

            caption_text = caption.text.strip()
            print(f"\nProcessing table: {caption_text}")

            # Extract year from caption
            year = None
            for word in caption_text.split():
                if word.isdigit() and len(word) == 4:  # Looking for 4-digit year
                    year = word
                    break

            if not year:
                print(f"No year found in caption: {caption_text}")
                continue

            print(f"Processing holidays for year {year}")
            holidays = []

            # Find the tbody if it exists
            tbody = table.find("tbody")
            if not tbody:
                tbody = table

            # Process each row in the table
            rows = tbody.find_all("tr")
            print(f"Found {len(rows)} rows in table")

            for row_index, row in enumerate(rows, 1):
                # Find all cells in the row
                cells = row.find_all(["th", "td"])

                if len(cells) >= 2:
                    # Extract date and title
                    date_cell = cells[0]
                    title_cell = cells[-1]

                    date_str = date_cell.text.strip()
                    holiday_name = title_cell.text.strip()

                    try:
                        # Parse and format the date
                        date_obj = datetime.strptime(f"{date_str} {year}", "%d %B %Y")
                        formatted_date = date_obj.strftime("%Y-%m-%d")

                        holidays.append({"date": formatted_date, "name": holiday_name})
                        print(f"Added holiday: {formatted_date} - {holiday_name}")
                    except ValueError as e:
                        print(f"Error parsing date: {date_str} - {e}")

            if holidays:
                holidays_by_year[year] = sorted(holidays, key=lambda x: x["date"])
                print(f"Added {len(holidays)} holidays for year {year}")

        if not holidays_by_year:
            print("No holiday data found for England and Wales")
            return None

        return holidays_by_year

    except requests.RequestException as e:
        print(f"Error fetching data: {e}")
        return None
    except Exception as e:
        print(f"Error processing data: {e}")
        print("Full error:", str(e))
        return None


def update_holidays_json():
    # Create scripts directory if it doesn't exist
    os.makedirs("js", exist_ok=True)

    # Fetch holidays
    print("\nFetching holiday data...")
    holidays_data = fetch_uk_holidays()

    if not holidays_data:
        print("Failed to fetch holiday data")
        return

    # Path to the JSON file
    json_path = "js/holidays.json"

    # Read existing data if file exists
    existing_data = {}
    if os.path.exists(json_path):
        try:
            print(f"\nReading existing data from {json_path}")
            with open(json_path, "r") as f:
                existing_data = json.load(f)
            print(f"Found existing data for years: {', '.join(existing_data.keys())}")
        except json.JSONDecodeError:
            print("Error reading existing JSON file")

    # Merge existing data with new data
    merged_data = {**existing_data, **holidays_data}

    # Sort years
    sorted_data = {str(year): merged_data[str(year)] for year in sorted(map(int, merged_data.keys()))}

    # Write updated data to file
    try:
        print("\nWriting updated data to file...")
        with open(json_path, "w") as f:
            json.dump(sorted_data, f, indent=4)
        print(f"Successfully updated {json_path}")
        print(f"Years included: {', '.join(sorted_data.keys())}")
    except Exception as e:
        print(f"Error writing JSON file: {e}")


if __name__ == "__main__":
    update_holidays_json()
