# Dynamic Calendar

A dynamic calendar application that displays a yearly calendar with highlighted UK bank holidays and alternate Wednesdays.

## Features

- Displays a full year calendar in a 6x2 grid layout
- Highlights UK bank holidays in light red
- Marks alternate Wednesdays (every 14 days) in light blue
- Highlights weekends in light red
- Supports PDF download for printing
- Automatically updates UK bank holiday data yearly

## Setup

1. Clone the repository:
```bash
git clone https://github.com/developer-subhajit/dynamic-calendar.git
cd dynamic-calendar
```

2. Open `index.html` in a web browser to view the calendar.

## Project Structure

- `index.html` - Main HTML file with calendar layout
- `css/styles.css` - Styling for the calendar
- `js/calendar.js` - Calendar generation logic
- `js/holidays.json` - UK bank holiday data
- `scripts/update_holidays.py` - Python script to fetch latest holiday data
- `scripts/requirements.txt` - Python dependencies for the update script

## Automation

The project includes a GitHub Actions workflow that:
- Runs annually on January 1st
- Fetches the latest UK bank holiday data from GOV.UK
- Updates the holidays.json file
- Automatically commits and pushes changes

## Development

To update the holiday data manually:

1. Install Python dependencies:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r scripts/requirements.txt
```

2. Run the update script:
```bash
python scripts/update_holidays.py
```

## License

MIT License
