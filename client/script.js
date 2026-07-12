const shareBtn = document.getElementById("shareBtn");
const phone = document.getElementById("phone");
const status = document.getElementById("status");

// Backend URL
const API_URL = "https://family-location-server.onrender.com";

// Create Map
const map = L.map("map").setView([20.5937, 78.9629], 5);

// Tile Layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let markers = [];

// --------------------
// Load Locations
// --------------------
async function loadLocations() {
    try {
        const response = await fetch(`${API_URL}/locations`);

        if (!response.ok) {
            throw new Error("Cannot load locations");
        }

        const locations = await response.json();

        markers.forEach(marker => map.removeLayer(marker));
        markers = [];

        locations.forEach(loc => {
            const marker = L.marker([loc.latitude, loc.longitude])
                .addTo(map)
                .bindPopup(
                    `<b>Phone:</b> ${loc.phone}<br>
                     <b>Time:</b> ${new Date(loc.time).toLocaleString()}`
                );

            markers.push(marker);
        });

    } catch (err) {
        console.error(err);
    }
}

loadLocations();
setInterval(loadLocations, 5000);

// --------------------
// Share Location
// --------------------
shareBtn.addEventListener("click", () => {

    const mobile = phone.value.trim();

    if (!/^[0-9]{10}$/.test(mobile)) {
        status.innerHTML = "❌ Enter a valid mobile number";
        return;
    }

    status.innerHTML = "📍 Getting location...";

    navigator.geolocation.getCurrentPosition(
        sendLocation,
        geoError,
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );

    async function sendLocation(position) {

        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        map.setView([latitude, longitude], 16);

        const marker = L.marker([latitude, longitude])
            .addTo(map)
            .bindPopup("📍 Your Location")
            .openPopup();

        markers.push(marker);

        status.innerHTML = "📤 Sending location...";

        try {

            const controller = new AbortController();

            const timer = setTimeout(() => {
                controller.abort();
            }, 10000);

            const response = await fetch(`${API_URL}/location`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    phone: mobile,
                    latitude,
                    longitude
                }),
                signal: controller.signal
            });

            clearTimeout(timer);

            const data = await response.json();

            if (data.success) {
                status.innerHTML = "✅ Location Shared Successfully";
                loadLocations();
            } else {
                status.innerHTML = "❌ " + data.message;
            }

        } catch (err) {

            console.error(err);

            if (err.name === "AbortError") {
                status.innerHTML = "❌ Request timed out";
            } else {
                status.innerHTML = "❌ " + err.message;
            }

        }

    }

    function geoError(error) {
        status.innerHTML = "❌ " + error.message;
    }

});