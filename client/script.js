const shareBtn = document.getElementById("shareBtn");
const nameInput = document.getElementById("name");
const status = document.getElementById("status");

const speech = document.querySelector(".speech");
const assistant = document.querySelector(".assistant");

// Highlight input when page loads
nameInput.classList.add("highlight");

// Backend URL
const API_URL = "https://family-location-server.onrender.com";

// Hidden Map
const map = L.map("map").setView([20.5937, 78.9629], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

let markers = [];

// =======================================
// Assistant Typing Effect
// =======================================

function typeMessage(message){

    speech.innerHTML="";

    let i=0;

    const typing=setInterval(()=>{

        speech.innerHTML+=message.charAt(i);

        i++;

        if(i>=message.length){

            clearInterval(typing);

        }

    },35);

}

setTimeout(()=>{

    typeMessage("👋 Hi! Please enter your name.");

},500);

// =======================================
// Input Events
// =======================================

nameInput.addEventListener("focus",()=>{

    typeMessage("😊 Great! Type your name.");

});

nameInput.addEventListener("input", () => {

    if (nameInput.value.trim() === "") {

        speech.textContent = "Please enter your name.";

    } else {

        speech.textContent = "Perfect! Click OK.";

    }

});

// =======================================
// Load Locations
// =======================================

async function loadLocations(){

    try{

        const response=await fetch(`${API_URL}/locations`);

        if(!response.ok){

            throw new Error("Cannot load locations");

        }

        const locations=await response.json();

        markers.forEach(marker=>map.removeLayer(marker));

        markers=[];

        locations.forEach(loc=>{

            const marker=L.marker([loc.latitude,loc.longitude])

            .addTo(map)

            .bindPopup(`
                <b>👤 Name:</b> ${loc.name}<br>
                <b>🕒 Time:</b> ${new Date(loc.time).toLocaleString()}<br><br>

                <a href="https://www.google.com/maps?q=${loc.latitude},${loc.longitude}" target="_blank">

                📍 Open in Google Maps

                </a>
            `);

            markers.push(marker);

        });

    }

    catch(err){

        console.log(err);

    }

}

loadLocations();

setInterval(loadLocations,5000);

// =======================================
// Share Button
// =======================================

shareBtn.addEventListener("click",()=>{

    const userName=nameInput.value.trim();

    if(userName===""){

        status.innerHTML="❌ Please enter your name";

        typeMessage("😅 Please enter your name first.");

        nameInput.classList.add("highlight");

        return;

    }

    status.innerHTML="📍 Getting your location...";

    typeMessage("📍 Getting your location...");

    navigator.geolocation.getCurrentPosition(

        sendLocation,

        geoError,

        {

            enableHighAccuracy:true,

            timeout:10000,

            maximumAge:0

        }

    );

});

// =======================================
// Send Location
// =======================================

async function sendLocation(position){

    const userName=nameInput.value.trim();

    const latitude=position.coords.latitude;

    const longitude=position.coords.longitude;

    status.innerHTML="📤 Sharing location...";

    typeMessage("🚀 Sharing your location...");

    try{

        const response=await fetch(`${API_URL}/location`,{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                name:userName,

                latitude,

                longitude

            })

        });

        const data=await response.json();

        if(data.success){

            status.innerHTML="✅ Location Shared Successfully";

            typeMessage("🎉 Location Shared Successfully!");

            assistant.style.transition="all 1.5s ease";

            assistant.style.transform="translateX(-500px)";

            assistant.style.opacity="0";

            loadLocations();

        }

        else{

            status.innerHTML="❌ "+data.message;

            typeMessage("😔 Something went wrong.");

        }

    }

    catch(err){

        console.log(err);

        status.innerHTML="❌ "+err.message;

        typeMessage("❌ Unable to connect.");

    }

}

// =======================================
// Location Error
// =======================================

function geoError(error){

    status.innerHTML="❌ "+error.message;

    typeMessage("📍 Please allow location access.");

}
const boy = document.getElementById("boy");

// Wave every 4 seconds
setInterval(() => {

    boy.style.animation = "wave .8s";

    setTimeout(() => {

        boy.style.animation = "";

    },800);

},4000);

// Jump while typing
nameInput.addEventListener("input",()=>{

    boy.style.animation="jump .5s";

    setTimeout(()=>{

        boy.style.animation="";

    },500);

});