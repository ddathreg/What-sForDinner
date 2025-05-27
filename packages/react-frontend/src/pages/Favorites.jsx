import React, { useState, useEffect } from "react";
import RestaurantList from "../components/RestaurantList";
import FunnyAd from "../components/FunnyAd";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/users/favorites", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch favorites");

      const data = await response.json();
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when favorites change
  useEffect(() => {
    fetchFavorites();
  }, []);

  if (loading) {
    return <div style={{ color: "white", textAlign: "center", marginTop: "20px" }}>Loading favorites...</div>;
  }

  if (!localStorage.getItem("authToken")) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%", color: "white" }}>
        <h1>Please sign in to view favorites</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", color: "white" }}>
      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>Your Favorite Restaurants</h1>
      {favorites.length > 0 ? (
        <RestaurantList
          restaurants={favorites}
          onFavoriteToggle={fetchFavorites} // Add this to refresh after toggling
        />
      ) : (
        <p style={{ textAlign: "center" }}>No favorites yet. Start adding some!</p>
      )}
      <FunnyAd />
    </div>
  );
};

export default Favorites;
