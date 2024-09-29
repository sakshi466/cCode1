const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = 3019;

// Middleware to serve static files, handle form data, and parse JSON
app.use(express.static(__dirname));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connection (correct syntax)
mongoose.connect('mongodb://127.0.0.1:27017/Emp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Successfully connected to MongoDB");
}).catch((error) => {
    console.error("Error connecting to MongoDB:", error);
});

// Define the schema to match First Name, Last Name, and Roll No
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    rollNo: String
});

// Define the model
const Users = mongoose.model("Users", userSchema);

// Serve the form on the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'form.html'));
});

// POST route to create a new user (C in CRUD)
app.post('/post', async (req, res) => {
    try {
        const { firstName, lastName, rollNo } = req.body;
        const user = new Users({ firstName, lastName, rollNo });
        await user.save();
        console.log(user);
        res.json({ message: "Form submitted", user });
    } catch (error) {
        res.status(500).json({ message: "Error creating user", error });
    }
});

// GET route to read/display all records (R in CRUD)
app.get('/users', async (req, res) => {
    try {
        const users = await Users.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving users", error });
    }
});

// POST route to update an existing user (U in CRUD)
app.post('/update/:id', async (req, res) => {
    try {
        const { firstName, lastName, rollNo } = req.body;
        const user = await Users.findById(req.params.id);

        if (user) {
            user.firstName = firstName;
            user.lastName = lastName;
            user.rollNo = rollNo;
            await user.save();
            res.json({ message: "Record updated", user });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error updating user", error });
    }
});

// POST route to delete a user (D in CRUD)
app.post('/delete/:id', async (req, res) => {
    try {
        const user = await Users.findByIdAndDelete(req.params.id);
        if (user) {
            res.json({ message: "Record deleted" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting user", error });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
