// backend.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
//import restaurantServices from "./models/restaurant-services.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import connectDB from "./database.js";
import { Restaurant, getRestaurantModel } from "./models/restaurant.js";

dotenv.config();

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());
app.use("/users", userRoutes);
connectDB();

const options = {
  method: "GET",
  headers: {
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    "x-rapidapi-host": "tripadvisor-scraper.p.rapidapi.com",
  },
};

async function fetchRestaurants(page, location) {
  const encodedLocation = encodeURIComponent(location);
  const url = `https://tripadvisor-scraper.p.rapidapi.com/restaurants/list?query=${encodedLocation}&page=${page}`;

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    const restaurants = data.results || [];

    for (const restaurant of restaurants) {
      const restaurantDetails = {
        id: restaurant.id,
        name: restaurant.name,
        link: restaurant.link,
        reviews: restaurant.reviews,
        rating: restaurant.rating,
        price_range_usd: restaurant.price_range_usd,
        menu_link: restaurant.menu_link,
        reservation_link: restaurant.reservation_link,
        featured_image: restaurant.featured_image,
        has_delivery: restaurant.has_delivery,
        cuisines: restaurant.cuisines,
      };

      try {
        const newRestaurant = new Restaurant(restaurantDetails);
        await newRestaurant.save();
      } catch (dbError) {
        console.error(
          `Error saving restaurant ${restaurant.name}:`,
          dbError.message,
        );
      }
    }
    console.log("Saves completed");
  } catch (error) {
    console.error(
      `Error fetching or storing restaurants from page ${page} in ${location}:`,
      error.message,
    );
  }
}

async function fetchAllRestaurants(location) {
  for (let i = 1; i <= 25; i++) {
    await fetchRestaurants(i, location);
  }
  console.log("all saves complete");
}

//slo pages 1-5, 148 restaurants
//sf pages 1-25, 737 restaurants
//nyc pages 1-25, 730 restaurnts
//la pages 1-25, 729 restaurants
//nola pages 1-25, 734 restaurants
//chi pages 1-25, 721 restaurants
//mia pages 1-25, 717 restaurants
//atx pages 1-25, 713 restaurants
//hnl pages 1-20, 585 restaurants //max api calls

//fetchAllRestaurants("Honolulu"); //DONT UNCOMMENT

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/restaurants", restaurantRoutes);
app.use("/users", userRoutes);

app.listen(process.env.PORT || port, () => {
  console.log("REST API is listening.");
});
