// Function to populate year dropdown from holidays.json
async function populateYearDropdown() {
    try {
        const response = await fetch("js/holidays.json");
        const holidays = await response.json();
        const years = Object.keys(holidays).sort((a, b) => b - a); // Sort years in descending order

        const yearSelect = document.getElementById("year-select");
        yearSelect.innerHTML = ""; // Clear existing options

        years.forEach((year) => {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        });

        // Set default year to current year or closest available year
        const currentYear = new Date().getFullYear().toString();
        if (years.includes(currentYear)) {
            yearSelect.value = currentYear;
        } else {
            const closestYear = years.reduce((prev, curr) => {
                return Math.abs(parseInt(curr) - parseInt(currentYear)) <
                    Math.abs(parseInt(prev) - parseInt(currentYear))
                    ? curr
                    : prev;
            });
            yearSelect.value = closestYear;
        }

        // Create initial calendar
        createCalendar(parseInt(yearSelect.value), "calendar-grid");
    } catch (error) {
        console.error("Error loading holidays:", error);
    }
}

// Function to check if a date is an alternate Wednesday
function isAlternateWednesday(date) {
    // Use January 1, 2025 as our reference point (which has 1st, 15th, 29th as the pattern)
    const referenceDate = new Date(2025, 0, 1); // January 1, 2025
    let firstWednesday = new Date(2025, 0, 1); // Start with January 1, 2025

    // Find first Wednesday of 2025 (which is January 1st)
    while (firstWednesday.getDay() !== 3) {
        firstWednesday.setDate(firstWednesday.getDate() + 1);
    }

    // Only proceed if it's a Wednesday
    if (date.getDay() !== 3) return false;

    // Calculate weeks difference from the first Wednesday of 2025
    const diffTime = date.getTime() - firstWednesday.getTime();
    const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
    const diffWeeks = Math.floor(diffDays / 7);

    // If the weeks difference is even (including 0), it follows the same pattern as our reference
    return diffWeeks % 2 === 0;
}

function getAlternateWednesdays(year, month) {
    const wednesdays = [];

    // Find the first Wednesday of the year
    let firstWedOfYear = new Date(year, 0, 1); // Start with January 1st
    while (firstWedOfYear.getDay() !== 3) {
        // 3 is Wednesday
        firstWedOfYear.setDate(firstWedOfYear.getDate() + 1);
    }

    // Get the first and last day of the target month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Start from the first Wednesday of the year and increment by 14 days
    let currentDate = new Date(firstWedOfYear);

    // Move to the first Wednesday that could be in our target month
    while (currentDate < firstDayOfMonth) {
        currentDate.setDate(currentDate.getDate() + 14);
    }

    // If we went too far, go back one interval
    if (currentDate > firstDayOfMonth && currentDate.getDate() > 14) {
        currentDate.setDate(currentDate.getDate() - 14);
    }

    // Collect all Wednesdays in the month
    while (currentDate <= lastDayOfMonth) {
        if (currentDate.getMonth() === month) {
            wednesdays.push(currentDate.getDate());
        }
        currentDate.setDate(currentDate.getDate() + 14);
    }

    return wednesdays;
}

function createMonthElement(year, monthIndex, monthName, holidays) {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthDiv = document.createElement("div");
    monthDiv.className = "month";

    // Create month title
    const monthTitle = document.createElement("div");
    monthTitle.className = "month-title";
    monthTitle.textContent = monthName;
    monthDiv.appendChild(monthTitle);

    // Create weekdays header
    const weekdaysDiv = document.createElement("div");
    weekdaysDiv.className = "weekdays";
    weekdays.forEach((day) => {
        const dayDiv = document.createElement("div");
        dayDiv.textContent = day;
        weekdaysDiv.appendChild(dayDiv);
    });
    monthDiv.appendChild(weekdaysDiv);

    // Create days grid
    const daysDiv = document.createElement("div");
    daysDiv.className = "days";

    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const numDays = lastDay.getDate();
    const alternateWednesdays = getAlternateWednesdays(year, monthIndex);

    // Add empty cells for days before the first day of the month
    let firstDayIndex = firstDay.getDay(); // Sunday is 0, no need to adjust
    for (let i = 0; i < firstDayIndex; i++) {
        const emptyDay = document.createElement("div");
        daysDiv.appendChild(emptyDay);
    }

    // Add days of the month
    for (let day = 1; day <= numDays; day++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "day";
        const currentDate = new Date(year, monthIndex, day);
        const dateString = currentDate.toISOString().split("T")[0];
        const dayOfWeek = currentDate.getDay();

        // Check for weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            dayDiv.classList.add("weekend");
        }

        // Check for bank holidays
        const isHoliday = holidays.some(
            (holiday) => holiday.date === dateString
        );
        if (isHoliday) {
            dayDiv.classList.add("weekend");
            const holiday = holidays.find((h) => h.date === dateString);
            dayDiv.title = holiday.name; // Add tooltip with holiday name
        }

        // Check for alternate Wednesdays
        if (alternateWednesdays.includes(day)) {
            dayDiv.classList.add("highlighted");
        }

        dayDiv.textContent = day;
        daysDiv.appendChild(dayDiv);
    }

    monthDiv.appendChild(daysDiv);
    return monthDiv;
}

async function createCalendar(year, containerId) {
    try {
        // Fetch holidays data
        const response = await fetch("js/holidays.json");
        const holidaysData = await response.json();
        const yearHolidays = holidaysData[year.toString()] || [];

        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
        ];

        const calendarDiv = document.getElementById(containerId);
        if (!calendarDiv) {
            console.error(`Container with id '${containerId}' not found`);
            return;
        }

        // Remove existing header if present
        const existingHeader = document.querySelector(".calendar-header");
        if (existingHeader) {
            existingHeader.remove();
        }

        // Clear calendar content
        calendarDiv.innerHTML = "";

        // Add year header
        const yearHeader = document.createElement("div");
        yearHeader.className = "calendar-header";
        const yearTitle = document.createElement("h1");
        yearTitle.textContent = `${year} Calendar`;
        yearHeader.appendChild(yearTitle);
        calendarDiv.parentElement.insertBefore(yearHeader, calendarDiv);

        // Create months
        months.forEach((monthName, monthIndex) => {
            const monthElement = createMonthElement(
                year,
                monthIndex,
                monthName,
                yearHolidays
            );
            calendarDiv.appendChild(monthElement);

            // Add placeholder element for the last column in each row
            if ((monthIndex + 1) % 6 === 0 && monthIndex < 11) {
                calendarDiv.appendChild(document.createElement("div")); // 7th column placeholder
            }
        });

        // Add final placeholders if needed
        const remainingPlaceholders = 7 - (months.length % 7);
        if (remainingPlaceholders < 7) {
            for (let i = 0; i < remainingPlaceholders; i++) {
                calendarDiv.appendChild(document.createElement("div"));
            }
        }
    } catch (error) {
        console.error("Error creating calendar:", error);
    }
}

// Function to download calendar as PDF
async function downloadPDF() {
    const element = document.getElementById("pdf-container");
    const opt = {
        margin: 10,
        filename: `calendar_${
            document.getElementById("year-select").value
        }.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };

    try {
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error("Error generating PDF:", error);
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
    populateYearDropdown();

    // Add event listener for year change
    document.getElementById("year-select").addEventListener("change", (e) => {
        createCalendar(parseInt(e.target.value), "calendar-grid");
    });

    // Add event listener for download button
    document
        .getElementById("download-btn")
        .addEventListener("click", downloadPDF);
});
