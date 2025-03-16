const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();

app.use(express.json()); // Middleware to parse JSON
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// User Model
const User = require("./models/user1");

// Routes
app.post("/user1", async (req, res) => {
  try {
    const users = req.body; // Expecting an array of users
    if (!Array.isArray(users)) {
      return res.status(400).json({ error: "Input should be an array of users" });
    }
    const newUsers = await User.insertMany(users);
    res.status(201).json(newUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.get("/user1", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.put("/user1", async (req, res) => {
  try {
    const users = req.body; // Expecting an array of objects with _id and updated data

    if (!Array.isArray(users)) {
      return res.status(400).json({ error: "Input should be an array of users" });
    }

    const updatePromises = users.map(user =>
      User.findByIdAndUpdate(user._id.trim(), user, { new: true })
    );

    const updatedUsers = await Promise.all(updatePromises);
    res.json(updatedUsers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.delete("/user1", async (req, res) => {
  try {
      const { userIds } = req.body; // Extract user IDs from request body

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
          return res.status(400).json({ error: "Invalid user IDs provided" });
      }

      // Delete users whose IDs are in the provided array
      const result = await User.deleteMany({ _id: { $in: userIds } });

      if (result.deletedCount === 0) {
          return res.status(404).json({ error: "No users found to delete" });
      }

      res.json({ message: "Users deleted successfully", deletedCount: result.deletedCount });
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});



// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
