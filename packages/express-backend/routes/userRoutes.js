import express from "express";
import Users from "../models/users.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import authenticateToken from "./authMiddleware.js";
import { Restaurant } from "../models/restaurant.js";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
router.use(express.json());

function generateAccessToken(username) {
  return jwt.sign({ username }, process.env.TOKEN_SECRET, {
    expiresIn: "600s",
  });
}

// Route to get user by ID
router.get("/id/:id", async (req, res) => {
  try {
    const userId = req.params.id.trim();
    const user = await Users.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
  }
});

// Route to get user by username
router.get("/username/:username", async (req, res) => {
  const username = req.params.username;
  console.log(username);
  const user = await Users.find({ name: username });
  console.log(user);
  res.json(user);
});

// Route to get all users
router.get("/", async (req, res) => {
  const users = await Users.find();
  res.json(users);
});

// Route to log in a user
router.post("/login", async (req, res) => {
  try {
    const username = req.body.username;
    const passwd = req.body.passwd;

    if (!username || !passwd) {
      return res.status(400).send("Username and password are required");
    }

    const user = await Users.findOne({ name: username });

    if (!user) {
      return res.status(404).send("User not found");
    }

    if (user.name && user.passwd) {
      const isValid = await bcrypt.compare(String(passwd), String(user.passwd));
      if (isValid) {
        const token = jwt.sign(
          { username: user.name },
          process.env.TOKEN_SECRET,
          {
            expiresIn: "600s",
          },
        );
        return res.status(200).send(token);
      }
    }

    return res.status(401).send("Invalid credentials");
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("Internal server error");
  }
});

// Route to sign up a user
router.post("/signup", async (req, res) => {
  const username = req.body.username;
  const passwd = req.body.passwd;

  if (!username || !passwd) {
    return res.status(400).send("Invalid username and password");
  }

  const user = await Users.exists({ name: username });

  if (user) {
    return res.status(409).send("Username already taken");
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPwd = await bcrypt.hash(String(passwd), salt);
    const token = generateAccessToken(username);

    console.log(username);
    console.log(passwd);

    const new_user = [
      {
        name: username,
        passwd: hashedPwd,
      },
    ];

    console.log(new_user);

    await Users.create(new_user);

    console.log("JWT: ", token);
    return res.status(201).send(token);
  }
});

// Add this above the authenticated routes

// Public endpoint for guest location (from query or default)
router.get("/guest/location", (req, res) => {
  // Optionally, allow ?location=slo or default to slo
  const location = req.query.location || "slo";
  res.json({ location });
});

// Public endpoint for guest filters (returns empty/default filters)
router.get("/guest/filters", (req, res) => {
  res.json({
    filters: {
      searchQuery: "",
      type: "",
      price: "",
      min_rating: "",
    },
  });
});

// Route to update user details (bio, email, phone, profilePic)
router.put("/update", authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const { bio, email, phone, profilePic, displayName } = req.body;

    // Validate email format
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Validate phone format (basic validation)
    if (phone && !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number format." });
    }

    const user = await Users.findOne({ name: username });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Update user details
    if (displayName) user.displayName = displayName;
    if (bio) user.bio = bio;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (profilePic) user.profilePic = profilePic;

    await user.save();
    res
      .status(200)
      .json({ message: "User details updated successfully.", user });
  } catch (error) {
    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Route to get user details (including favorites)
router.get("/details", authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const user = await Users.findOne({ name: username }).select("-passwd");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/favorites", authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const user = await Users.findOne({ name: username })
      .select("-passwd")
      .populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user.favorites);
  } catch (error) {
    console.error("Error updating favorites:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Add route to toggle favorite status
router.post("/favorites", authenticateToken, async (req, res) => {
  try {
    const username = req.user.username;
    const restaurant = req.body.restaurant;

    if (!restaurant) {
      return res.status(400).json({ message: "Restaurant data is required." });
    }

    const user = await Users.findOne({ name: username });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const existingFavorite = user.favorites.find(
      (fav) => fav.name === restaurant.name
    );

    if (!existingFavorite) {
      // Add to favorites
      user.favorites.push(restaurant);
    } else {
      // Remove from favorites
      user.favorites = user.favorites.filter(
        (fav) => fav.name !== restaurant.name
      );
    }

    await user.save();
    res.status(200).json({ favorites: user.favorites });
  } catch (error) {
    console.error("Error updating favorites:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Add verify token route
router.get("/verify", authenticateToken, (req, res) => {
  try {
    res.status(200).json({ valid: true });
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ message: "Invalid token" });
  }
});

router.get("/location", authenticateToken, async (req, res) => {
  try {
    const user = await Users.findOne({ name: req.user.username });

    if (!user) return res.status(404).send("User not found");

    res.json({ location: user.location });
  } catch (err) {
    console.error("Error getting location:", err);
    res.status(500).send("Server error");
  }
});

router.get("/filters", authenticateToken, async (req, res) => {
  try {
    const user = await Users.findOne({ name: req.user.username });

    if (!user) return res.status(404).send("User not found");

    res.json({ filters: user.filters });
  } catch (err) {
    console.error("Error getting filters:", err);
    res.status(500).send("Server error");
  }
});

router.patch("/filters", authenticateToken, async (req, res) => {
  try {
    const { filters } = req.body;

    const user = await Users.findOneAndUpdate(
      { name: req.user.username },
      { filters },
      { new: true },
    );

    if (!user) return res.status(404).send("User not found");

    res.json({
      message: "Filters updated successfully",
      filters: user.filters,
    });
  } catch (err) {
    console.error("Error updating filters:", err);
    res.status(500).send("Server error");
  }
});

router.patch("/location", authenticateToken, async (req, res) => {
  try {
    const { location } = req.body;

    // Update the user's location
    const user = await Users.findOneAndUpdate(
      { name: req.user.username },
      { location },
      { new: true },
    );

    if (!user) {
      return res.status(404).send("User not found");
    }

    res.json({
      message: "Location updated successfully",
      location: user.location,
    });
  } catch (err) {
    console.error("Error updating location:", err);
    res.status(500).send("Server error");
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/recommendations/:location", authenticateToken, (req, res) => {
  const location = req.params.location || "slo";
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token not provided" });
  }

  const scriptPath = path.join(__dirname, "../recommender.py");
  const python = spawn("python", [scriptPath, location, token], {
    cwd: path.dirname(scriptPath),
  });

  let result = "";
  let errorOutput = "";

  python.stdout.on("data", (data) => {
    result += data.toString();
  });

  python.stderr.on("data", (data) => {
    errorOutput += data.toString();
  });

  python.on("close", (code) => {
    if (code !== 0) {
      return res
        .status(500)
        .json({ error: "Python script error", details: errorOutput });
    }

    try {
      const parsed = JSON.parse(result);
      res.json(parsed);
    } catch (err) {
      res.status(500).json({ error: "Failed to parse Python output", result });
    }
  });
});

// Get visited restaurants
router.get("/visited", authenticateToken, async (req, res) => {
  try {
    const user = await Users.findOne({ name: req.user.username })
      .select("visitedRestaurants")
      .lean(); // Add lean() for better performance
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Sort by most recent first
    const sortedVisited = user.visitedRestaurants.sort((a, b) => 
      new Date(b.visitDate) - new Date(a.visitDate)
    );
    
    res.json(sortedVisited);
  } catch (error) {
    console.error("Error fetching visited restaurants:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add/Update visited restaurant
router.post("/visited", authenticateToken, async (req, res) => {
  try {
    const { restaurantId, name, rating, review, images } = req.body;
    
    if (!restaurantId || !name || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const user = await Users.findOne({ name: req.user.username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingIndex = user.visitedRestaurants.findIndex(
      r => r.restaurantId === restaurantId || r.name === name
    );

    const visitData = {
      restaurantId,
      name,
      rating,
      review,
      images,
      visitDate: new Date()
    };

    if (existingIndex > -1) {
      user.visitedRestaurants[existingIndex] = {
        ...user.visitedRestaurants[existingIndex],
        ...visitData
      };
    } else {
      user.visitedRestaurants.unshift(visitData); // Add new visits to the beginning
    }

    await user.save();
    res.json(user.visitedRestaurants);
  } catch (error) {
    console.error("Error updating visited restaurants:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update visited restaurant review
router.put("/visited", authenticateToken, async (req, res) => {
  try {
    const { restaurantId, name, rating, review, images } = req.body;
    
    if (!restaurantId || !name || !rating) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (review && review.length > 300) {
      return res.status(400).json({ message: "Review must be 300 characters or less" });
    }

    const user = await Users.findOne({ name: req.user.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const visitedIndex = user.visitedRestaurants.findIndex(
      r => r.restaurantId === restaurantId
    );

    if (visitedIndex === -1) {
      return res.status(404).json({ message: "Restaurant review not found" });
    }

    user.visitedRestaurants[visitedIndex] = {
      ...user.visitedRestaurants[visitedIndex],
      rating,
      review,
      images, // Add images to the update
      visitDate: new Date()
    };

    await user.save();
    res.json(user.visitedRestaurants);
  } catch (error) {
    console.error("Error updating restaurant review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
