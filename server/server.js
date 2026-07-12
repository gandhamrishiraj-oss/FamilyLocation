console.log("SERVER FILE STARTED");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ======================
// MongoDB Connection
// ======================

async function startServer() {
    try {

        const MONGO_URI =
            process.env.MONGODB_URI ||
            "mongodb+srv://rishi:Test123@cluster0.myylxse.mongodb.net/familyLocation?retryWrites=true&w=majority&appName=Cluster0";

        await mongoose.connect(MONGO_URI);

        console.log("✅ MongoDB Connected");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });

    } catch (err) {

        console.error("❌ MongoDB Connection Failed");
        console.error("Message:", err.message);
        console.error(err);

        process.exit(1);
    }
}

startServer();

// ======================
// Schema
// ======================

const locationSchema = new mongoose.Schema({
    phone: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    time: {
        type: Date,
        default: Date.now
    }
});

const Location = mongoose.model("Location", locationSchema);

// ======================
// Save Location
// ======================

app.post("/location", async (req, res) => {
    try {

        const { phone, latitude, longitude } = req.body;

        if (!phone || latitude == null || longitude == null) {
            return res.status(400).json({
                success: false,
                message: "Missing data"
            });
        }

        const location = new Location({
            phone,
            latitude,
            longitude
        });

        await location.save();

        console.log("✅ Location Saved");

        res.json({
            success: true,
            message: "Location Saved Successfully"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });

    }
});

// ======================
// Get Locations
// ======================

app.get("/locations", async (req, res) => {
    try {

        const locations = await Location.find().sort({ time: -1 });

        res.json(locations);

    } catch (err) {

        console.error(err);

        res.status(500).json([]);

    }
});

// ======================
// Home
// ======================

app.get("/", (req, res) => {
    res.send("✅ Family Location Server Running");
});