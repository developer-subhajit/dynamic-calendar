let holidayData = null;

async function loadHolidays() {
    try {
        const response = await fetch("js/holidays.json");
        holidayData = await response.json();
    } catch (error) {
        console.error("Error loading holidays:", error);
        holidayData = {};
    }
}

// Load holidays when the module is imported
loadHolidays();

export function isUKBankHoliday(date) {
    if (!holidayData) return false;

    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const dateString = `${year}-${month}-${day}`;

    // Check if we have data for this year
    if (holidayData[year]) {
        return holidayData[year].some((holiday) => holiday.date === dateString);
    }

    // For years not in our data, return false
    return false;
}
