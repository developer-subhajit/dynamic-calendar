import { isUKBankHoliday } from "./holidays.js";

export function getAlternateWednesdays(year, month) {
    const wednesdays = [];
    const date = new Date(year, month, 1);
    const firstDayOfWeek = date.getDay();

    // Calculate the first Wednesday
    let firstWed = 1 + ((3 + 7 - firstDayOfWeek) % 7);

    // Calculate 2nd and 4th Wednesdays
    const secondWed = firstWed + 7;
    const fourthWed = secondWed + 14;

    // Only add if they're within the month
    const lastDay = new Date(year, month + 1, 0).getDate();
    if (secondWed <= lastDay) wednesdays.push(secondWed);
    if (fourthWed <= lastDay) wednesdays.push(fourthWed);

    return wednesdays;
}

export function createMonthElement(year, monthIndex, monthName) {
    const weekdays = ["S", "M", "T", "W", "T", "F", "S"];
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

    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement("div");
        emptyDay.className = "day";
        daysDiv.appendChild(emptyDay);
    }

    // Add days of the month
    for (let i = 1; i <= numDays; i++) {
        const dayDiv = document.createElement("div");
        dayDiv.className = "day";
        const currentDate = new Date(year, monthIndex, i);
        const dayOfWeek = currentDate.getDay();

        // Check for holidays (weekends and bank holidays)
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        const isBankHoliday = isUKBankHoliday(currentDate);

        // Add highlighted class for Wednesdays
        if (alternateWednesdays.includes(i)) {
            dayDiv.classList.add("highlighted");
        }

        // Add weekend class for holidays
        if (isWeekend || isBankHoliday) {
            dayDiv.classList.add("weekend");
        }

        dayDiv.textContent = i;
        daysDiv.appendChild(dayDiv);
    }

    monthDiv.appendChild(daysDiv);
    return monthDiv;
}

export async function createCalendar(year, containerId) {
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

    months.forEach((monthName, monthIndex) => {
        const monthElement = createMonthElement(year, monthIndex, monthName);
        calendarDiv.appendChild(monthElement);
    });
}
