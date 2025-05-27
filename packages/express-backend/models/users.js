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
  location: {
    type: String,
    default: "slo",
  },
  favorites: [
    {
      name: String,
      link: String,
      reviews: Number,
      rating: Number,
      price_range_usd: String,
      menu_link: String,
      reservation_link: String,
      featured_image: String,
      has_delivery: Boolean,
      cuisines: [String],
    },
  ],
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
