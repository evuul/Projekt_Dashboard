




document.addEventListener("DOMContentLoaded", () => {
    loadLinks(); 
    document.getElementById("show-form-btn").addEventListener("click", showForm);
});

function showForm() {
    document.getElementById("link-form").style.display = "block";
    document.getElementById("show-form-btn").style.display = "none";
}

function hideForm() {
    document.getElementById("link-form").style.display = "none";
    document.getElementById("show-form-btn").style.display = "block";
}

function addLink() {
    const linkName = document.getElementById("link-name").value.trim();
    const linkURL = document.getElementById("link-url").value.trim();
    const linksList = document.getElementById("links-list");

    if (!linkName || !linkURL) {
        alert("Fyll i både namn och URL!");
        return;
    }

    // Skapa nytt listobjekt
    const newLink = document.createElement("li");
    newLink.innerHTML = `<a href="${linkURL}" target="_blank">${linkName}</a> 
                         <button onclick="removeLink(this)">❌</button>`;

    linksList.appendChild(newLink);

    // Spara i LocalStorage
    saveLink(linkName, linkURL);

    // Rensa fält och göm formuläret
    document.getElementById("link-name").value = "";
    document.getElementById("link-url").value = "";
    hideForm();
}

function removeLink(button) {
    const listItem = button.parentElement;
    const linkName = listItem.querySelector("a").innerText;

    // Ta bort från LocalStorage
    removeLinkFromStorage(linkName);

    // Ta bort från listan
    listItem.remove();
}

function saveLink(name, url) {
    let links = JSON.parse(localStorage.getItem("savedLinks")) || [];
    links.push({ name, url });
    localStorage.setItem("savedLinks", JSON.stringify(links));
}

function removeLinkFromStorage(name) {
    let links = JSON.parse(localStorage.getItem("savedLinks")) || [];
    links = links.filter(link => link.name !== name);
    localStorage.setItem("savedLinks", JSON.stringify(links));
}

function loadLinks() {
    const linksList = document.getElementById("links-list");
    let links = JSON.parse(localStorage.getItem("savedLinks")) || [];

    links.forEach(link => {
        const listItem = document.createElement("li");
        listItem.innerHTML = `<a href="${link.url}" target="_blank">${link.name}</a> 
                              <button onclick="removeLink(this)">❌</button>`;
        linksList.appendChild(listItem);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const titleElement = document.getElementById("editable-title");

    // Ladda sparad rubrik om den finns
    const savedTitle = localStorage.getItem("dashboardTitle");
    if (savedTitle) {
        titleElement.textContent = savedTitle;
    }

    // Gör rubriken redigerbar vid klick
    titleElement.addEventListener("click", () => {
        const currentText = titleElement.textContent;
        const input = document.createElement("input");
        input.type = "text";
        input.value = currentText;
        input.style.fontSize = "2rem"; // Anpassa storlek

        // Byt ut rubriken mot input-fältet
        titleElement.replaceWith(input);
        input.focus();

        // Spara ändring när användaren trycker Enter eller klickar utanför
        const saveTitle = () => {
            const newText = input.value.trim() || "Min Dashboard"; // Standardvärde om tomt
            localStorage.setItem("dashboardTitle", newText);
            titleElement.textContent = newText;
            input.replaceWith(titleElement);
        };

        input.addEventListener("blur", saveTitle); // Spara vid klick utanför
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                saveTitle();
            }
        });
    });
});
function updateDateTime() {
    const now = new Date();

    // Formatera datum (ex: Måndag, 6 mars 2025)
    const options = {year: 'numeric', month: 'long', day: 'numeric'};
    const formattedDate = now.toLocaleDateString('sv-SE', options);

    // Formatera klockan (ex: 14:30:45)
    const formattedTime = now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
    // Uppdatera elementen i HTML
    document.querySelector(".date").textContent = formattedDate;
    document.querySelector(".clock").textContent = formattedTime;
}

// Uppdatera tiden varje sekund
setInterval(updateDateTime, 1000);

// Kör funktionen direkt vid start
updateDateTime();

    //<------ BAKGRUNDSBILD ------->

// Funktion för att byta bakgrundsbild från Unsplash API med Fetch API
async function changeBackground() {
    const apiKey = 'E_1NnPtK1MqmSsNsI_z8Eb_5Gcpbu418ocfgWV1yvsw';
    const apiUrl = `https://api.unsplash.com/photos/random?query=architecture&client_id=${apiKey}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`HTTP-fel! Status: ${response.status}`);
        }

        const data = await response.json();
        const newBackgroundUrl = data.urls.regular;

        // Ändra bakgrundsbilden på body-elementet
        document.body.style.backgroundImage = `url(${newBackgroundUrl})`;

        // Spara den nya bakgrundsbilden i localStorage
        localStorage.setItem('background', `url(${newBackgroundUrl})`);

    } catch (error) {
        console.error('Det uppstod ett fel vid hämtning av bakgrundsbilden:', error);
    }
}