// const mongoose = require("mongoose");
// const { MongoMemoryServer } = require("mongodb-memory-server");
// const Users = require("../models/users");

import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Users from "../models/users";

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

describe("User Model Tests", () => {
  it("should create and save a user successfully", async () => {
    const exampleUser = {
      name: "Will Kim",
      passwd: "iamWillKimm12!@",
      email: "will@example.com",
      bio: "Software Engineer",
      phone: "123-456-7890",
      profilePic: "https://example.com/will.jpg",
      location: "New York",
      favorites: [{ restaurantId: "111", name: "Pizza Hut" }],
      history: [{ restaurantId: "222", name: "McDonald's" }],
    };

    const user = new Users(exampleUser);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(exampleUser.name);
    expect(savedUser.email).toBe(exampleUser.email);
    expect(savedUser.bio).toBe(exampleUser.bio);
    expect(savedUser.phone).toBe(exampleUser.phone);

    expect(savedUser.favorites).toHaveLength(1);
    expect(savedUser.history).toHaveLength(1);
  });

  it("should not save a user without required fields", async () => {
    const user = new Users({ bio: "Missing required fields" });

    let failed;
    try {
      await user.save();
    } catch (error) {
      failed = error;
    }

    expect(failed).toBeDefined();
    expect(failed.errors.name).toBeDefined();
    expect(failed.errors.email).toBeUndefined();
  });

  it("should find a user by email", async () => {
    const userData = { name: "Jane", email: "jane@example.com", passwd: "Janepassword1!"};
    await Users.create(userData);

    const user = await Users.findOne({ email: userData.email });

    expect(user).toBeDefined();
    expect(user.name).toBe(userData.name);
  });


});
