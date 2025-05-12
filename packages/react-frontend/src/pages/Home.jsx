import React, { useState, useEffect } from "react";
import CustomWheel from "../components/wheel";
import RestaurantModal from "../components/RestaurantModal";
import FunnyAd from "../components/FunnyAd";
import "../CSS/home.css";

const Home = () => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const [open, setOpen] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [city, setCity] = useState("");
  const [filters, setFilters] = useState({
    searchQuery: "",
    type: "",
    price: "",
    min_rating: "",
  });
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  const fetchLocation = async () => {
    try {
      let res;
      if (localStorage.getItem("authToken")) {
        res = await fetch("http://localhost:8000/users/location", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
      } else {
        // Use guest endpoint if not authenticated
        res = await fetch("http://localhost:8000/users/guest/location");
      }
      const data = await res.json();
      setCity((data.location || "slo").toLowerCase());
    } catch (err) {
      setCity("slo");
      console.error("Error fetching user location:", err);
    }
  };

  const fetchFilters = async () => {
    try {
      let res;
      if (localStorage.getItem("authToken")) {
        res = await fetch("http://localhost:8000/users/filters", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
      } else {
        // Use guest endpoint if not authenticated
        res = await fetch("http://localhost:8000/users/guest/filters");
      }
      const data = await res.json();
      setFilters(data.filters);
      setFiltersLoaded(true);
    } catch (err) {
      console.error("Error fetching filters:", err);
    }
  };

  const fetchRestaurants = async (city, filters) => {
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

    try {
      const res = await fetch(
        `http://localhost:8000/restaurants/${city}?${queryParams}`,
      );
      const data = await res.json();

      if (Array.isArray(data) && data.length > 0) {
        setRestaurants(data);
      } else {
        console.error("Invalid data format or empty:", data);
        setRestaurants([]);
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setRestaurants([]);
    }
  };

  // Get user's city first
  useEffect(() => {
    fetchLocation();
    fetchFilters();
  }, []);

  // Once city is known, fetch restaurants
  useEffect(() => {
    if (city && filtersLoaded) {
      fetchRestaurants(city, filters);
    }
  }, [city, filters, filtersLoaded]);

  const handleSpinClick = () => {
    if (restaurants.length === 0) {
      console.warn("No restaurants available to spin.");
      return;
    }

    const randomIndex = Math.floor(Math.random() * restaurants.length);
    setPrizeNumber(randomIndex);
    setMustSpin(true);
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setSelectedItem(restaurants[prizeNumber]);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="home-container">
      <h1>What's For Dinner?</h1>
      <div className="filters-display">
        <p>
          <strong>City:</strong> {city || "Loading city..."}
        </p>
        <p>
          <strong>Search Query:</strong> {filters.searchQuery || "None"}
        </p>
        <p>
          <strong>Type:</strong> {filters.type || "Any"}
        </p>
        <p>
          <strong>Price:</strong> {filters.price || "Any"}
        </p>
        <p>
          <strong>Minimum Rating:</strong> {filters.min_rating || "Any"}
        </p>
      </div>
      {restaurants.length > 0 ? (
        <>
          <CustomWheel
            mustSpin={mustSpin}
            prizeNumber={prizeNumber}
            onStopSpinning={handleStopSpinning}
            data={restaurants.map((r, index) => ({
              option: "",
              style: {
                backgroundColor: [
                  "red",
                  "blue",
                  "green",
                  "yellow",
                  "purple",
                  "orange",
                  "pink",
                  "brown",
                ][index % 8],
              },
            }))}
          />
          <button className="spin-button" onClick={handleSpinClick}>
            Spin the Wheel!
          </button>
        </>
      ) : (
        <p>Loading restaurants or no restaurants found...</p>
      )}
      {selectedItem && <p>Selected Restaurant: {selectedItem.name}</p>}

      <RestaurantModal
        open={open}
        handleClose={handleClose}
        selectedItem={selectedItem}
      />
      <FunnyAd />
    </div>
  );
};

export default Home;
