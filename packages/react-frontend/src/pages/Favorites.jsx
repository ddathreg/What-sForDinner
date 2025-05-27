import React, { useState, useEffect } from "react";
import RestaurantList from "../components/RestaurantList";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [referenceFavorite, setReferenceFavorite] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async (token) => {
    const response = await fetch("http://localhost:8000/users/favorites", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) throw new Error("Unauthorized");
    const data = await response.json();
    setFavorites(data || []);
  };

  // Fetch user location to use for recommendations
  const fetchLocation = async (token) => {
    const response = await fetch("http://localhost:8000/users/location", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) throw new Error("Unauthorized");
    const data = await response.json();
    return data.location || "slo"; // fallback location
  };

  // Fetch recommendations based on location
  const fetchRecommendations = async (token, location) => {
    const response = await fetch(
      `http://localhost:8000/users/recommendations/${location}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (response.status === 401) throw new Error("Unauthorized");
    const data = await response.json();
    const ref = data.reference_favorite || null;
    const filteredRecommendations = (data.recommendations || []).filter(
      (rec) => !ref || rec.name !== ref.name,
    );
    setRecommendations(filteredRecommendations);
    setReferenceFavorite(ref);
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setLoading(false);
        return;
      }

      setIsSignedIn(true);
      await fetchFavorites(token);
      const location = await fetchLocation(token);
      await fetchRecommendations(token, location);
    } catch (error) {
      console.error(error);
      setIsSignedIn(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ color: "white" }}>Loading favorites...</div>;
  }

  if (!localStorage.getItem("authToken")) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%", color: "white" }}>
        <h1>Please sign in to visit favorites & recommendations </h1>
      </div>
    );
  }

  return (
    <div style={{ color: "white" }}>
      <h1>Your Favorite Restaurants</h1>
      {favorites.length > 0 ? (
        <RestaurantList restaurants={favorites} />
      ) : (
        <p>No favorite restaurants found.</p>
      )}
      <h1>Recommended</h1>
      <h2>Becasue you liked {referenceFavorite.name} </h2>
      {recommendations.length > 0 ? (
        <RestaurantList restaurants={recommendations} />
      ) : (
        <p>No recommendations available.</p>
      )}
    </div>
  );
};

export default Favorites;
