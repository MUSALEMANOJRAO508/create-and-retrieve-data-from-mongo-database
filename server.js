const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const port = 3020;
const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Ensure JSON data is parsed correctly

// Connecting to MongoDB server
mongoose.connect('mongodb://127.0.0.1:27017/students')
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });


const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('MongoDB connection successful');
});

// Define Mongoose Schema and Model
const userSchema = new mongoose.Schema({
    cname: { type: String, required: true },
    mail: { type: String, required: true },
    contact: { type: Number, required: true },
    gender: { type: String, required: true }
});

const User = mongoose.model("students", userSchema);

app.post('/post', async (req, res) => {
    try {
        console.log("Raw request body:", req.body); // Log the entire request body

        const { cname, mail, contact, gender } = req.body;
        console.log("Extracted values -", { cname, mail, contact, gender });

        if (!cname || !mail || !contact || !gender) {
            console.log("❌ Some fields are missing!");
            return res.status(400).send("Missing required fields");
        }

        const user = new User({ cname, mail, contact, gender });
        await user.save();
        console.log("✅ User successfully saved to MongoDB:", user);
        res.send("Form submission successful");
    } catch (error) {
        console.error("Error saving user:", error);
        res.status(500).send("Error saving user");
    }
});

//fetch all data

app.get("/fetchall", async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.json(users); // Send as JSON response
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Error fetching users");
    }
});

// Serve form.html when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "form.html"));
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
