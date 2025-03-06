"use strict";

document.addEventListener('DOMContentLoaded', function(){


// Google Calendar API Key and Calendar ID
const apiKey = "AIzaSyDvLcy32jJgxuQhr3snDrcsW_KeHRYKBSY";
const calendarId = "djordjemarkovic96@gmail.com";

// Funkcija za dobijanje zauzetih datuma sa Google kalendara
async function getBookedDates() {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${apiKey}&singleEvents=true&orderBy=startTime`);
    const data = await response.json();

    // Pretvaranje Google kalendar datuma u lokalnu vremensku zonu (GMT+01:00)
    const bookedDates = data.items.map(event => {
        const startDate = new Date(event.start.dateTime || event.start.date);
        const endDate = new Date(event.end.dateTime || event.end.date);

        // Pretvaramo datume u lokalnu vremensku zonu
        const localStartDate = new Date(startDate.toLocaleDateString('en-US', { timeZone: 'Europe/Belgrade' }));
        const localEndDate = new Date(endDate.toLocaleDateString('en-US', { timeZone: 'Europe/Belgrade' }));

        return {
            startDate: localStartDate,
            endDate: localEndDate
        };
    });

    return bookedDates;
}

// Funkcija za inicijalizaciju Flatpickr-a sa blokiranim datumima
async function initializeFlatpickr() {
    // Dohvati zauzete datume sa Google Calendar-a
    const bookedDates = await getBookedDates();

    // Dobijanje trenutnog datuma (dan posle danas)
    const today = new Date();
    today.setDate(today.getDate() + 1); // Postavljanje na dan nakon današnjeg
    const todayString = today.toLocaleDateString('en-CA'); // Format za Flatpickr: YYYY-MM-DD

    // Flatpickr za Arrival Date
    const arrivalDatePicker = flatpickr("#arrivalDate", {
        dateFormat: "Y-m-d",
        minDate: todayString, // Sprečava odabir prošlih datuma
        disable: [
            ...bookedDates.map(date => ({
                from: date.startDate,
                to: new Date(date.endDate.getTime() - 1) // Ne blokiraj poslednji dan (end date)
            }))
        ],
        onChange: function(selectedDates, dateStr, instance) {
            // Postavljanje minimalnog datuma za Departure Date kada se odabere Arrival Date
            departureDatePicker.set('minDate', selectedDates[0]);
        }
    });

    // Flatpickr za Departure Date
    const departureDatePicker = flatpickr("#departureDate", {
        dateFormat: "Y-m-d",
        minDate: todayString, // Sprečava odabir prošlih datuma
        disable: [
            ...bookedDates.map(date => ({
                from: new Date(date.startDate),
                to: new Date(date.endDate.getTime() - 1) // Ne blokiraj poslednji dan (end date)
            }))
        ]
    });
}

// Pozivanje funkcije da inicijalizuje Flatpickr
initializeFlatpickr();


document.querySelector("#subBtn").addEventListener("click", function (event) {
    event.preventDefault(); // Sprečava podrazumevano ponašanje forme

    const form = document.getElementById("booking");
    const successMessage = document.getElementById("successMessage");

    // Provera da li su svi obavezni inputi popunjeni
    const requiredFields = form.querySelectorAll("[required]");
    let allFieldsFilled = true;

    requiredFields.forEach((field) => {
        if (!field.value.trim()) {
            allFieldsFilled = false;
            field.classList.add("field-error"); // Dodaj error klasu za nepopunjeno polje
        } else {
            field.classList.remove("field-error"); // Ukloni error klasu
        }
    });

    // Ako neka obavezna polja nisu popunjena, prikazuje se poruka i prekida slanje
    if (!allFieldsFilled) {
        alert("Please fill in all required fields.");
        return;
    }

    // Kreiranje XMLHttpRequest objekta za slanje podataka
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://hook.eu2.make.com/a2rmxjdhqwrx1jaegrspnk1n2naneict", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    // Prikupljanje podataka iz forme
    const formData = new FormData(form);
    const data = new URLSearchParams();
    formData.forEach((value, key) => {
        data.append(key, value); // Dodavanje svakog inputa kao ključ-vrednost par
    });

    // Slanje podataka na Make Webhook URL
    xhr.send(data.toString());

    // Obrada odgovora sa servera
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Ako je uspešno poslato, prikazuje success poruku
            successMessage.style.display = "block";
            form.style.display = "none"; // Sakrij formu
            
            // Ponovno učitavanje stranice nakon 5 sekundi
            // setTimeout(function () {
            //     location.reload();
            // }, 5000);
        } else {
            alert("Oops! Something went wrong while submitting the form.");
        }
    };

    // Obrada greške pri slanju
    xhr.onerror = function () {
        alert("An error occurred while submitting the form.");
    };
});

// Poziv funkcije za prikazivanje zauzetih datuma (ako je potrebno)
fetchUnavailableDates();


});