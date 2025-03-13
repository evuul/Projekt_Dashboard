// Vänta på att dokumentet laddas innan vi kör funktionerna
document.addEventListener("DOMContentLoaded", () => {
    loadLinks();
    setupTitleEditing();
    updateDateTime();
    setInterval(updateDateTime, 1000); // Uppdatera klockan varje sekund
    enableDragAndDrop(); // Aktivera drag-and-drop-funktionen
    getUserLocation(); // Hämta användarens position och visa vädret
    fetchNasaPicture(); // Hämta NASA-bilden
});

// Funktion för att hämta NASA:s Astronomy Picture of the Day med async/await
async function fetchNasaPicture() {
    const apiKey = 'DEMO_KEY'; // Din API-nyckel
    const apiUrl = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;

    try {
        // Hämta data från API:t
        const response = await fetch(apiUrl);
        
        // Kontrollera om svaret är OK
        if (!response.ok) {
            throw new Error('Det gick inte att hämta data från NASA API');
        }

        // Konvertera svaret till JSON
        const data = await response.json();

        const imageUrl = data.url;
        const imageTitle = data.title;
        const imageExplanation = data.explanation;

        // Hämta container-elementet för NASA-bilden
        const nasaContent = document.getElementById("nasa-content");

        // Uppdatera innehållet med NASA-bild och förklaring
        nasaContent.innerHTML = `
            <img src="${imageUrl}" alt="${imageTitle}" style="max-width: 100%; height: auto;">
        `;
    } catch (error) {
        console.error('Det gick inte att hämta NASA-bilden:', error);
    }
}

// Hantering av länkar

function showForm() {
    document.getElementById("link-form").style.display = "block";
    document.getElementById("show-form-btn").style.display = "none";
}

function hideForm() {
    document.getElementById("link-form").style.display = "none";
    document.getElementById("show-form-btn").style.display = "block";
}

document.addEventListener("DOMContentLoaded", () => {
    loadLinks();
    setupTitleEditing();
    updateDateTime();
    setInterval(updateDateTime, 1000);
    enableDragAndDrop();

    // Koppla knappen till att visa formuläret
    document.getElementById("show-form-btn").addEventListener("click", showForm);

    // Koppla knappen till att spara länken
    document.querySelector("#link-form button:first-of-type").addEventListener("click", addLink);
});

function addLink() {
    let linkName = document.getElementById("link-name").value.trim();
    let linkURL = document.getElementById("link-url").value.trim();
    const linksList = document.getElementById("links-list");

    // Kontrollera om användaren har fyllt i både namn och URL
    if (!linkName || !linkURL) {
        return; // Om fälten inte är ifyllda, gör ingenting och visa inget meddelande
    }

    // Lägg till "http://" om användaren inte har angett det i URL:en
    if (!linkURL.startsWith("http://") && !linkURL.startsWith("https://")) {
        linkURL = "http://" + linkURL; // Lägg till http:// om det inte finns
    }

    // Hämta favicon från URL
    let domain;
    try {
        domain = new URL(linkURL).hostname;
    } catch (error) {
        // Om URL:en är felaktig, gör ingenting och gå vidare
        return;
    }
    let faviconURL = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

    // Skapa nytt listobjekt
    const newLink = document.createElement("li");
    newLink.innerHTML = `
        <img src="${faviconURL}" alt="Favicon" class="favicon">
        <a href="${linkURL}" target="_blank">${linkName}</a> 
        <button class="remove-link-btn" onclick="removeLink(this)"><i class="fas fa-trash"></i></button>
    `;

    const listItem = document.createElement("li");
    listItem.innerHTML = `
            <img src="${faviconURL}" alt="Favicon" class="favicon">
            <a href="${linkURL}" target="_blank"><i class="fas fa-link"></i> ${linkName}</a>
            <button class="remove-link-btn" onclick="removeLink(this)"><i class="fas fa-trash"></i></button>
    `;

    // Lägg till den nya länken till listan
    linksList.appendChild(newLink);
    saveLink(linkName, linkURL);

    // Rensa fälten och göm formuläret
    document.getElementById("link-name").value = "";
    document.getElementById("link-url").value = "";
    hideForm();
}

// Funktion för att ta bort en länk
function removeLink(button) {
    const listItem = button.parentElement;
    const linkName = listItem.querySelector("a").innerText;
    
    // Ta bort länken från storage
    removeLinkFromStorage(linkName);
    
    // Ta bort länken från DOM
    listItem.remove();
}

// Funktion för att spara en länk i localStorage
function saveLink(name, url) {
    let links = JSON.parse(localStorage.getItem("savedLinks")) || [];
    links.push({ name, url });
    localStorage.setItem("savedLinks", JSON.stringify(links));
}

// Funktion för att ta bort en länk från localStorage
function removeLinkFromStorage(name) {
    let links = JSON.parse(localStorage.getItem("savedLinks")) || [];
    links = links.filter(link => link.name !== name);
    localStorage.setItem("savedLinks", JSON.stringify(links));
}

// Funktion för att ladda länkar från localStorage
function loadLinks() {
    const linksList = document.getElementById("links-list");
    let links = JSON.parse(localStorage.getItem("savedLinks")) || [];

    links.forEach(link => {
        let domain = new URL(link.url).hostname;
        let faviconURL = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

        const listItem = document.createElement("li");
        listItem.innerHTML = `
            <img src="${faviconURL}" alt="Favicon" class="favicon">
            <a href="${link.url}" target="_blank">${link.name}</a> 
            <button class="remove-link-btn" onclick="removeLink(this)"><i class="fas fa-trash"></i></button>
        `;
        linksList.appendChild(listItem);
    });
}

// Redigerbar Dashboard-titel

function setupTitleEditing() {
    const titleElement = document.getElementById("editable-title");
    const savedTitle = localStorage.getItem("dashboardTitle");

    if (savedTitle) {
        titleElement.textContent = savedTitle;
    }

    titleElement.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "text";
        input.value = titleElement.textContent;
        input.style.fontSize = "2rem"; // Anpassa storlek

        titleElement.replaceWith(input);
        input.focus();

        const saveTitle = () => {
            const newText = input.value.trim() || "Min Dashboard"; // Standardvärde
            localStorage.setItem("dashboardTitle", newText);
            input.replaceWith(titleElement);
            titleElement.textContent = newText;
        };

        input.addEventListener("blur", saveTitle);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") saveTitle();
        });
    });
}

// Datum och tid

function updateDateTime() {
    const now = new Date();

    // Formatera datum (ex: Måndag, 6 mars 2025)
    const formattedDate = now.toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });

    // Formatera klockan (ex: 14:30)
    const formattedTime = now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

    // Uppdatera HTML-element
    document.querySelector(".date").textContent = formattedDate;
    document.querySelector(".clock").textContent = formattedTime;
}

// Bakgrundsbild från Unsplash API

async function changeBackground() {
    const apiKey = 'E_1NnPtK1MqmSsNsI_z8Eb_5Gcpbu418ocfgWV1yvsw';
    const apiUrl = `https://api.unsplash.com/collections/1065376/photos?client_id=${apiKey}`;
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP-fel! Status: ${response.status}`);

        const data = await response.json();
        
        // Välj en slumpmässig bild från samlingen
        const randomImage = data[Math.floor(Math.random() * data.length)];

        if (!randomImage || !randomImage.urls) {
            throw new Error("Ingen giltig bild hittades.");
        }

        const newBackgroundUrl = randomImage.urls.regular;
        document.body.style.backgroundImage = `url(${newBackgroundUrl})`;

        // Spara bakgrund i localStorage
        localStorage.setItem('background', `url(${newBackgroundUrl})`);

    } catch (error) {
        console.error('Fel vid hämtning av bakgrundsbild:', error);
    }
}
// väderfunktioner 
// API-nyckel för OpenWeatherMap
const apiKey = "bd5e378503939ddaee76f12ad7a97608";

// Funktion för att hämta väderdata
async function fetchWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fel vid väderhämtning: ${response.status}`);
        const data = await response.json();
        displayWeather(data);
    } catch (error) {
        console.error("Något gick fel vid väderhämtning:", error);
    }
}

// Funktion för att visa väderdata i väderboxen
function displayWeather(data) {
    const weatherList = data.list;

    // Hämta väderboxen
    const weatherBox = document.getElementById("weather-box");
    weatherBox.innerHTML = '<h2>🌤️ Väder</h2>'; // Rensa och sätt rubrik

    // Skapa en container för alla dagliga boxar
    const weatherContainer = document.createElement("div");
    weatherContainer.classList.add("weather-container");

    // Funktion för att uppdatera vädret för en dag
    function updateWeatherDay(dayIndex) {
        const weather = weatherList[dayIndex];
        const iconCode = weather.weather[0].icon;
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        // Skapa en ny box för den dagen
        const dayBox = document.createElement("div");
        dayBox.classList.add("weather-day-box");

        const dayDate = new Date(weather.dt * 1000); // Unix timestamp till datum
        const dayName = dayDate.toLocaleDateString("sv-SE", { weekday: "long" });

        dayBox.innerHTML = `
            <strong>${dayName}</strong><br>
            <img src="${iconUrl}" alt="Väder ikon"><br>
            ${Math.round(weather.main.temp)}°C
        `;

        weatherContainer.appendChild(dayBox);
    }

    // Uppdatera för idag, imorgon och i övermorgon
    updateWeatherDay(0);  // Idag
    updateWeatherDay(8);  // Imorgon
    updateWeatherDay(16); // I övermorgon

    weatherBox.appendChild(weatherContainer); // Lägg till alla dagboxar i huvudboxen
}

// Funktion för att hämta användarens position
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeather(lat, lon);
        }, (error) => {
            console.error("Kunde inte hämta användarens position", error);
        });
    } else {
        alert("Geolocation är inte tillgängligt i din webbläsare.");
    }
}

// Drag and Drop Funktionalitet för Boxar
function enableDragAndDrop() {
    const boxes = document.querySelectorAll(".box");
    const dashboard = document.querySelector(".dashboard");

    let draggedBox = null;

    boxes.forEach((box) => {
        box.setAttribute("draggable", "true"); // Gör boxarna dragbara

        box.addEventListener("dragstart", (e) => {
            draggedBox = box;
            setTimeout(() => {
                box.style.opacity = "0.5"; 
            }, 0);
        });

        box.addEventListener("dragend", () => {
            draggedBox = null;
            boxes.forEach(b => b.classList.remove("drag-over"));
            setTimeout(() => {
                box.style.opacity = "1"; 
            }, 0);
        });

        box.addEventListener("dragover", (e) => {
            e.preventDefault(); // Måste förhindra standardbeteendet här
            box.classList.add("drag-over"); // Lägg till en visuell effekt vid hover

            // Här kan vi lägga till en visuell feedback för att visa var boxen kommer att hamna
            const allBoxes = Array.from(dashboard.children);
            const draggedIndex = allBoxes.indexOf(draggedBox);
            const targetIndex = allBoxes.indexOf(box);

            // Om boxen är ovanför mållådan, sätt den innan den
            if (draggedIndex > targetIndex) {
                dashboard.insertBefore(draggedBox, box);
            } else {
                dashboard.insertBefore(draggedBox, box.nextSibling);
            }
        });

        box.addEventListener("dragleave", () => {
            box.classList.remove("drag-over");
        });

        box.addEventListener("drop", (e) => {
            e.preventDefault(); // Förhindrar standardbeteendet

            if (draggedBox !== box) {
                let allBoxes = Array.from(dashboard.children);
                let draggedIndex = allBoxes.indexOf(draggedBox);
                let targetIndex = allBoxes.indexOf(box);

                // Byt plats på boxarna
                if (draggedIndex > targetIndex) {
                    dashboard.insertBefore(draggedBox, box);
                } else {
                    dashboard.insertBefore(draggedBox, box.nextSibling);
                }
            }
            boxes.forEach(b => b.classList.remove("drag-over"));
        });
    });
}
document.addEventListener("DOMContentLoaded", enableDragAndDrop); // Se till att scriptet körs efter att sidan har laddats