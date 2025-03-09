// app.js

// 1. UVOZ FLATPICKR-A (ES6 модул)
import flatpickr from "https://cdn.jsdelivr.net/npm/flatpickr/dist/esm/index.min.js";
import "https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css";

// 2. GOOGLE CALENDAR SETUP
const API_KEY = "AIzaSyDvLcy32jJgxuQhr3snDrcsW_KeHRYKBSY"; // Замените овај кључ!
const CALENDAR_ID = "djordjemarkovic96@gmail.com";

// 3. GLAVNE FUNKCIJE
async function getBookedDates() {
  try {
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${CALENDAR_ID}/events?key=${API_KEY}&singleEvents=true&orderBy=startTime`
    );
    const data = await response.json();

    return data.items.map(event => {
      const start = new Date(event.start.dateTime || event.start.date);
      const end = new Date(event.end.dateTime || event.end.date);
      
      // Корекција за временску зону
      return {
        start: new Date(start.getTime() + 3600000), // GMT+1
        end: new Date(end.getTime() + 3600000)
      };
    });
  } catch (error) {
    console.error("Google Calendar Error:", error);
    return [];
  }
}

// 4. FLATPICKR INIT
async function initDatePickers() {
  const bookedDates = await getBookedDates();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Arrival Date Picker
  const arrivalPicker = flatpickr("#arrivalDate", {
    minDate: tomorrow,
    dateFormat: "Y-m-d",
    disable: bookedDates.map(date => ({
      from: date.start,
      to: date.end
    })),
    onChange: (selectedDates) => {
      departurePicker.set("minDate", selectedDates[0]);
    }
  });

  // Departure Date Picker
  const departurePicker = flatpickr("#departureDate", {
    minDate: tomorrow,
    dateFormat: "Y-m-d",
    disable: bookedDates.map(date => ({
      from: date.start,
      to: date.end
    }))
  });
}

// 5. FORM SUBMIT HANDLER
function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector("#subBtn");
  
  // Валидација
  const isValid = [...form.elements].every(input => {
    if(input.required && !input.value.trim()) {
      input.classList.add("field-error");
      return false;
    }
    input.classList.remove("field-error");
    return true;
  });

  if(!isValid) {
    alert("Popunite sva obavezna polja!");
    return;
  }

  // Submit логика
  submitBtn.disabled = true;
  submitBtn.textContent = "Šaljem...";

  const formData = new URLSearchParams(new FormData(form));
  
  fetch("https://hook.eu2.make.com/a2rmxjdhqwrx1jaegrspnk1n2naneict", {
    method: "POST",
    body: formData
  })
  .then(response => {
    if(response.ok) {
      document.getElementById("successMessage").style.display = "block";
      form.style.display = "none";
      setTimeout(() => location.reload(), 5000);
    }
  })
  .catch(error => {
    console.error("Submit Error:", error);
    alert("Došlo je do greške!");
  })
  .finally(() => {
    submitBtn.disabled = false;
    submitBtn.textContent = "Pošalji";
  });
}

// 6. INIT SVEGA
document.addEventListener("DOMContentLoaded", () => {
  // Покрени Flatpickr
  initDatePickers();
  
  // Додај submit handler
  document.getElementById("booking").addEventListener("submit", handleFormSubmit);
});