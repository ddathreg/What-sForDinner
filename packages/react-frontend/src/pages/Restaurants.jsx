import React, { useState, useEffect, useCallback } from "react";
import RestaurantList from "../components/RestaurantList";
import SearchFilter from "../components/SearchFilter";
import FunnyAd from "../components/FunnyAd";
import LocationPicker from "../components/LocationPicker";
import "../CSS/restaurants.css";

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [filters, setFilters] = useState({
    searchQuery: "",
    type: "",
    price: "",
    min_rating: "",
  });
  const [city, setCity] = useState("");
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  const fetchLocation = async () => {
    try {
      if (localStorage.getItem("authToken")) {
        const res = await fetch(
          "https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/location",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          },
        );
        const data = await res.json();
        setCity((data.location || "slo").toLowerCase());
      } else {
        // For guests, read from localStorage
        const guestLocation = localStorage.getItem("guestLocation") || "slo";
        setCity(guestLocation.toLowerCase());
      }
    } catch (err) {
      const defaultLocation = localStorage.getItem("guestLocation") || "slo";
      setCity(defaultLocation.toLowerCase());
      console.error("Error fetching location:", err);
    }
  };

  const fetchFilters = async () => {
    try {
      let res;
      if (localStorage.getItem("authToken")) {
        res = await fetch(
          "https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/filters",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          },
        );
      } else {
        // Use guest endpoint if not authenticated
        res = await fetch(
<<<<<<< HEAD
          "https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/guest/filters",
=======
          "https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/guest/filters",
>>>>>>> cca4a3d5e501c4fa8119dc2ee83c1aa82de9cd85
        );
      }
      const data = await res.json();
      setFilters(data.filters);
      setFiltersLoaded(true);
    } catch (err) {
      console.error("Error fetching filters:", err);
    }
  };

  const saveFilters = async (newFilters) => {
    if (localStorage.getItem("authToken")) {
      try {
        await fetch(
          "https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/filters",
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
            body: JSON.stringify({ filters: newFilters }),
          },
        );
      } catch (err) {
        console.error("Error saving filters:", err);
      }
    } else {
      // Save guest filters to localStorage
      localStorage.setItem("guestFilters", JSON.stringify(newFilters));
    }
  };

  const fetchRestaurants = async (city) => {
    if (!city) {
      console.error("City parameter is required!");
      return Promise.reject("City parameter is required");
    }

    let queryParams = new URLSearchParams();

    if (filters.searchQuery) queryParams.append("search", filters.searchQuery);
    if (filters.type) queryParams.append("type", filters.type);
    if (filters.price) queryParams.append("price", filters.price);
    if (filters.min_rating > 0)
      queryParams.append("min_rating", filters.min_rating);

    const res = await fetch(
      `https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/restaurants/${city}?${queryParams}`,
    );
    return res.json();
  };

  // On mount, fetch location and filters
  useEffect(() => {
    fetchLocation();
    fetchFilters();
  }, []);

  // Fetch restaurants when city and filters load
  useEffect(() => {
    if (city && filtersLoaded) {
      fetchRestaurants(city)
        .then((data) => setRestaurants(data))
        .catch((error) => console.error(error));
    }
  }, [city, filtersLoaded, filters]);

  // Save filters only after filters have been loaded
  useEffect(() => {
    if (filtersLoaded) {
      saveFilters(filters);
    }
  }, [filters]);

  const handleVisitStatusChange = useCallback(() => {
    // Refresh restaurants data to reflect new visit status
    if (city && filtersLoaded) {
      fetchRestaurants(city)
        .then((data) => setRestaurants(data))
        .catch((error) => console.error(error));
    }
  }, [city, filtersLoaded]);

  return (
    <div className="restaurants-page">
      <h1>Restaurants</h1>
      <LocationPicker
        token={localStorage.getItem("authToken")}
        onLocationChange={setCity}
      />
      <SearchFilter filters={filters} setFilters={setFilters} city={city} />
      {restaurants.length > 0 ? (
        <RestaurantList
          restaurants={restaurants}
          onVisitStatusChange={handleVisitStatusChange}
        />
      ) : (
        <p>No restaurants found</p>
      )}
      <FunnyAd />
    </div>
  );
};

export default Restaurants;
