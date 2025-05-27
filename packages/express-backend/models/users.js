import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  displayName: String,
  passwd: {
    type: String,
    required: true,
  },
  bio: String,
  email: String,
  phone: String,
  profilePic: String,
  location: String,
  favorites: [{ type: Object }],
  history: [{ type: Object }],
  filters: {
    searchQuery: { type: String, default: "" },
    type: { type: String, default: "" },
    price: { type: String, default: "" },
    min_rating: { type: Number, default: 0 },
  },
});

UserSchema.index({ name: 1 }, { unique: true });

const Users = mongoose.model("User", UserSchema);

export default Users;
