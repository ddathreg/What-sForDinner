// const mongoose = require("mongoose");
import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: String,
  reviews: Number,
  rating: Number,
  price_range_usd: String,
  menu_link: String,
  reservation_link: String,
  featured_image: String,
  has_delivery: Boolean,
  cuisines: [String],
});

restaurantSchema.index({ name: 1 }, { unique: true });

//change collection name
//slo_restaurants
//sf_restaurants
//nyc_restaurants

//used to create collections
const Restaurant = mongoose.model("_Restaurants", restaurantSchema);

const getRestaurantModel = (city) => {
  const collectionName = `${city.trim().toLowerCase().replace(/\s+/g, "_")}_restaurants`;
  return mongoose.model(collectionName, restaurantSchema);
};

// module.exports = { Restaurant, getRestaurantModel };
export { Restaurant, getRestaurantModel };
