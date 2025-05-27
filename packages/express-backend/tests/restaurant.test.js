const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const { Restaurant, getRestaurantModel } = require("../models/restaurant");

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = await mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 30000);

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
}, 30000);

describe("Restaurant Model Tests", () => {
  it("should create and save a restaurant successfully", async () => {
    const restaurantData = {
      name: "McDonald's",
      link: "https://www.mcdonalds.com",
      reviews: 500,
      rating: 4.1,
      price_range_usd: "$",
      menu_link: "https://www.mcdonalds.com/menu",
      reservation_link: "https://www.mcdonalds.com/reservation",
      featured_image: "https://via.placeholder.com/150",
      has_delivery: true,
      cuisines: ["American", "Fast Food", "Burgers"],
    };

    const newRestaurant = new Restaurant(restaurantData);
    const savedRestaurant = await newRestaurant.save();

    expect(savedRestaurant._id).toBeDefined();
    expect(savedRestaurant.name).toBe(restaurantData.name);
    expect(savedRestaurant.link).toBe(restaurantData.link);
    expect(savedRestaurant.reviews).toBe(restaurantData.reviews);
    expect(savedRestaurant.rating).toBe(restaurantData.rating);
    expect(savedRestaurant.price_range_usd).toEqual(restaurantData.price_range_usd);
    expect(savedRestaurant.menu_link).toBe(restaurantData.menu_link);
    expect(savedRestaurant.reservation_link).toBe(restaurantData.reservation_link);
    expect(savedRestaurant.featured_image).toBe(restaurantData.featured_image);
    expect(savedRestaurant.has_delivery).toBe(restaurantData.has_delivery);
    expect(savedRestaurant.cuisines).toEqual(restaurantData.cuisines);
  });

  it("should fail if required fields are missing", async () => {
    const invalidRestaurant = new Restaurant({});

    let failed;
    try {
      await invalidRestaurant.save();
    } catch (error) {
      failed = error;
    }

    expect(failed).toBeDefined();
    expect(failed.errors.name).toBeDefined();
  });

  it("should retrieve a restaurant by name", async () => {
    const restaurantData = {
      name: "Test Restaurant",
      cuisines: ["Italian"]
    };
    await Restaurant.create(restaurantData);

    const foundRestaurant = await Restaurant.findOne({ name: restaurantData.name });
    expect(foundRestaurant).toBeDefined();
    expect(foundRestaurant.name).toBe(restaurantData.name);
    expect(foundRestaurant.cuisines).toEqual(restaurantData.cuisines);
  });

  it("should create a restaurant model dynamically for a city", async () => {
    const cityName = "Paris";
    const cityRestaurantModel = getRestaurantModel(cityName);
    expect(cityRestaurantModel.modelName).toBe("paris_restaurants");

    const restaurantData = {
      name: "Le Test",
      cuisines: ["French"]
    };
    const restaurant = new cityRestaurantModel(restaurantData);
    const savedRestaurant = await restaurant.save();

    expect(savedRestaurant.name).toBe(restaurantData.name);
    expect(savedRestaurant.cuisines).toEqual(restaurantData.cuisines);
  });

  
});
