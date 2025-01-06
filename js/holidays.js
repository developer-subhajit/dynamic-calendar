export function getEasterSunday(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
}

export function getUKBankHolidays(year) {
    const holidays = {};

    // Static holidays for 2024-2027 based on GOV.UK data
    const holidayDates = {
        2024: [
            { date: "2024-01-01", name: "New Year's Day" },
            { date: "2024-03-29", name: "Good Friday" },
            { date: "2024-04-01", name: "Easter Monday" },
            { date: "2024-05-06", name: "Early May bank holiday" },
            { date: "2024-05-27", name: "Spring bank holiday" },
            { date: "2024-08-26", name: "Summer bank holiday" },
            { date: "2024-12-25", name: "Christmas Day" },
            { date: "2024-12-26", name: "Boxing Day" },
        ],
        2025: [
            { date: "2025-01-01", name: "New Year's Day" },
            { date: "2025-04-18", name: "Good Friday" },
            { date: "2025-04-21", name: "Easter Monday" },
            { date: "2025-05-05", name: "Early May bank holiday" },
            { date: "2025-05-26", name: "Spring bank holiday" },
            { date: "2025-08-25", name: "Summer bank holiday" },
            { date: "2025-12-25", name: "Christmas Day" },
            { date: "2025-12-26", name: "Boxing Day" },
        ],
        2026: [
            { date: "2026-01-01", name: "New Year's Day" },
            { date: "2026-04-03", name: "Good Friday" },
            { date: "2026-04-06", name: "Easter Monday" },
            { date: "2026-05-04", name: "Early May bank holiday" },
            { date: "2026-05-25", name: "Spring bank holiday" },
            { date: "2026-08-31", name: "Summer bank holiday" },
            { date: "2026-12-25", name: "Christmas Day" },
            { date: "2026-12-28", name: "Boxing Day (substitute day)" },
        ],
        2027: [
            { date: "2027-01-01", name: "New Year's Day" },
            { date: "2027-03-26", name: "Good Friday" },
            { date: "2027-03-29", name: "Easter Monday" },
            { date: "2027-05-03", name: "Early May bank holiday" },
            { date: "2027-05-31", name: "Spring bank holiday" },
            { date: "2027-08-30", name: "Summer bank holiday" },
            { date: "2027-12-27", name: "Christmas Day (substitute day)" },
            { date: "2027-12-28", name: "Boxing Day (substitute day)" },
        ],
    };

    // If we have static data for the year, use it
    if (holidayDates[year]) {
        holidayDates[year].forEach((holiday) => {
            holidays[holiday.date] = holiday.name;
        });
        return holidays;
    }

    // Fallback for years not in our static data
    // New Year's Day (if weekend, moves to Monday)
    let newYear = new Date(year, 0, 1);
    if (newYear.getDay() === 0) newYear = new Date(year, 0, 2);
    if (newYear.getDay() === 6) newYear = new Date(year, 0, 3);
    holidays[newYear.toISOString().split("T")[0]] = "New Year's Day";

    // Easter holidays
    const easterSunday = getEasterSunday(year);
    const goodFriday = new Date(easterSunday);
    goodFriday.setDate(easterSunday.getDate() - 2);
    const easterMonday = new Date(easterSunday);
    easterMonday.setDate(easterSunday.getDate() + 1);
    holidays[goodFriday.toISOString().split("T")[0]] = "Good Friday";
    holidays[easterMonday.toISOString().split("T")[0]] = "Easter Monday";

    // Early May Bank Holiday (First Monday in May)
    let mayDay = new Date(year, 4, 1);
    while (mayDay.getDay() !== 1) {
        mayDay.setDate(mayDay.getDate() + 1);
    }
    holidays[mayDay.toISOString().split("T")[0]] = "Early May bank holiday";

    // Spring Bank Holiday (Last Monday in May)
    let springBank = new Date(year, 4, 31);
    while (springBank.getDay() !== 1) {
        springBank.setDate(springBank.getDate() - 1);
    }
    holidays[springBank.toISOString().split("T")[0]] = "Spring bank holiday";

    // Summer Bank Holiday (Last Monday in August)
    let summerBank = new Date(year, 7, 31);
    while (summerBank.getDay() !== 1) {
        summerBank.setDate(summerBank.getDate() - 1);
    }
    holidays[summerBank.toISOString().split("T")[0]] = "Summer bank holiday";

    // Christmas Day (if weekend, moves to next weekday)
    let christmas = new Date(year, 11, 25);
    if (christmas.getDay() === 0) christmas = new Date(year, 11, 27);
    if (christmas.getDay() === 6) christmas = new Date(year, 11, 27);
    holidays[christmas.toISOString().split("T")[0]] = "Christmas Day";

    // Boxing Day (if weekend or Christmas moved, adjusts accordingly)
    let boxingDay = new Date(year, 11, 26);
    if (boxingDay.getDay() === 0) boxingDay = new Date(year, 11, 28);
    if (boxingDay.getDay() === 6) boxingDay = new Date(year, 11, 28);
    holidays[boxingDay.toISOString().split("T")[0]] = "Boxing Day";

    return holidays;
}

export function isUKBankHoliday(date) {
    const holidays = getUKBankHolidays(date.getFullYear());
    // Format the date in YYYY-MM-DD format, ensuring month and day are padded with zeros
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const dateString = `${date.getFullYear()}-${month}-${day}`;
    return dateString in holidays;
}
