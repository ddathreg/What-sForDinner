import React, { useState, useEffect } from "react";
import RestaurantList from "../components/RestaurantList";

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [referenceFavorite, setReferenceFavorite] = useState(null);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [isSignedIn, setIsSignedIn] = useState(false);

  const fetchFavorites = async (token) => {
    const response = await fetch(
      "https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/favorites",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (response.status === 401) throw new Error("Unauthorized");
    const data = await response.json();
    setFavorites(data || []);
    setLoadingFavorites(false);
  };

  // Fetch user location to use for recommendations
  const fetchLocation = async (token) => {
    const response = await fetch(
      "https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/location",
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (response.status === 401) throw new Error("Unauthorized");
    const data = await response.json();
    return data.location || "slo"; // fallback location
  };

  // Fetch recommendations based on location
  const fetchRecommendations = async (token, location) => {
    const response = await fetch(
      `https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/recommendations/${location}`,
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
<<<<<<< HEAD
=======
    setLoadingRecommendations(false);
>>>>>>> cca4a3d5e501c4fa8119dc2ee83c1aa82de9cd85
  };

  const fetchData = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      setIsSignedIn(false);
<<<<<<< HEAD
      setLoading(false);
=======
      setLoadingFavorites(false);
      setLoadingRecommendations(false);
>>>>>>> cca4a3d5e501c4fa8119dc2ee83c1aa82de9cd85
      return;
    }

    setIsSignedIn(true);
<<<<<<< HEAD
    setError(null);
=======
>>>>>>> cca4a3d5e501c4fa8119dc2ee83c1aa82de9cd85

    try {
      await fetchFavorites(token);
      const location = await fetchLocation(token);
      await fetchRecommendations(token, location);
    } catch (error) {
      console.error(error);
<<<<<<< HEAD
      setError(error.message || "An error occurred");
=======
>>>>>>> cca4a3d5e501c4fa8119dc2ee83c1aa82de9cd85
    } finally {
      setLoadingFavorites(false);
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

<<<<<<< HEAD
  if (loading) {
    return <p>Loading...</p>;
  }

=======
>>>>>>> cca4a3d5e501c4fa8119dc2ee83c1aa82de9cd85
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
<<<<<<< HEAD
      <h1>Recommended</h1>
      {referenceFavorite ? (
        <h2>Because you liked {referenceFavorite.name}</h2>
      ) : (
        <h2>Recommendations based on your favorites</h2>
      )}
      {recommendations.length > 0 ? (
        <RestaurantList restaurants={recommendations} />
      ) : (
        <p>No recommendations available.</p>
=======

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
>>>>>>> cca4a3d5e501c4fa8119dc2ee83c1aa82de9cd85
      )}
    </div>
  );
};

export default Favorites;
