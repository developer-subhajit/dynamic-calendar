import { createCalendar } from "./calendar.js";

export function initializeYearDropdown() {
    const currentYear = new Date().getFullYear();
    const select = document.getElementById("yearSelect");

    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        select.appendChild(option);
    }
}

export async function downloadPDF() {
    const element = document.getElementById("pdf-container");
    const options = {
        margin: 0,
        filename: `calendar_${document.getElementById("yearSelect").value}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" },
    };

    try {
        await html2pdf().set(options).from(element).save();
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Error generating PDF. Please try again.");
    }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
    initializeYearDropdown();

    // Initial calendar creation
    const year = parseInt(document.getElementById("yearSelect").value);
    await createCalendar(year, "calendar");

    // Event listeners
    document
        .getElementById("yearSelect")
        .addEventListener("change", async (e) => {
            await createCalendar(parseInt(e.target.value), "calendar");
        });

    document
        .querySelector(".download-btn")
        .addEventListener("click", downloadPDF);
});
