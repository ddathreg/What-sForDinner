import React, { useState, useEffect } from "react";
import RestaurantList from "../components/RestaurantList";
import FunnyAd from "../components/FunnyAd";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [referenceFavorite, setReferenceFavorite] = useState(null);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const fetchFavorites = async (token) => {
    const response = await fetch("http://localhost:8000/users/favorites", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.status === 401) throw new Error("Unauthorized");
    const data = await response.json();
    setFavorites(data || []);
    setLoadingFavorites(false);
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
    setLoadingRecommendations(false);
  };

  const fetchData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setIsSignedIn(false);
      setLoadingFavorites(false);
      setLoadingRecommendations(false);
      return;
    }

    setIsSignedIn(true);

    try {
      await fetchFavorites(token);
      const location = await fetchLocation(token);
      await fetchRecommendations(token, location);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingFavorites(false);
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!isSignedIn) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%", color: "white" }}>
        <h1>Please sign in to visit favorites & recommendations </h1>
      </div>
    );
  }

  if (loadingFavorites) {
    return <p>Loading favorites...</p>;
  }

  return (
    <div>
      <h1>Favorites</h1>
      {favorites.length > 0 ? (
        <RestaurantList restaurants={favorites} />
      ) : (
        <p>No favorite restaurants found.</p>
      )}

      <h1>Recommended</h1>
      {loadingRecommendations ? (
        <p>Loading recommendations...</p>
      ) : (
        <>
          {referenceFavorite ? (
            <h2>Because you liked {referenceFavorite.name}</h2>
          ) : null}
          {recommendations.length > 0 ? (
            <RestaurantList restaurants={recommendations} />
          ) : (
            <p>No recommendations available.</p>
          )}
        </>
      )}
      <FunnyAd />
    </div>
  );
};

export default Favorites;
