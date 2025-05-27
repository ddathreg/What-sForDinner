import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import "../CSS/RestaurantList.css";

//create RestaurantCard component
const RestaurantCard = ({ restaurant, userFavorites, onToggleFavorite }) => {
  const [hover, setHover] = useState(false);
  const isFavorited = userFavorites.some((fav) => fav.name === restaurant.name);

  return (
    <Card
      className="restaurant-card"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {(hover || isFavorited) && // Show star if hovered or favorited
        (isFavorited ? (
          <StarIcon
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              cursor: "pointer",
              color: "gold",
            }}
            onClick={() => onToggleFavorite(restaurant)}
          />
        ) : (
          <StarBorderIcon
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              cursor: "pointer",
              color: "primary",
              "&:hover": { color: "gold" },
            }}
            onClick={() => onToggleFavorite(restaurant)}
          />
        ))}
      <CardHeader title={restaurant.name} />
      <CardContent>
        <p className="restaurant-image">
          {restaurant.featured_image ? (
            <img
              src={restaurant.featured_image}
              alt={`${restaurant.name} image`}
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "auto",
              }}
            />
          ) : (
            "No image available"
          )}
        </p>
        <p className="restaurant-link">
          {restaurant.link ? (
            <a href={restaurant.link} target="_blank" rel="noopener noreferrer">
              Visit Website
            </a>
          ) : (
            "Unknown"
          )}
        </p>
        <p>
          Cuisines:{" "}
          {restaurant.cuisines.length > 0
            ? restaurant.cuisines.join(", ")
            : "NA"}
        </p>
        <p>Price Range: {restaurant.price_range_usd || "NA"}</p>
        <p>Average Rating: {restaurant.rating || "NA"}</p>
        <p>Reviews: {restaurant.reviews || "NA"}</p>
        <p>Has Delivery: {restaurant.has_delivery ? "Yes" : "No"}</p>

        {/* Menu Link */}
        <p>
          {restaurant.menu_link ? (
            <a
              href={restaurant.menu_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Menu
            </a>
          ) : (
            "Menu Not Available"
          )}
        </p>

        {/* Reservation Link */}
        <p className="restaurant-link">
          {restaurant.reservation_link ? (
            <a
              href={restaurant.reservation_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              Make a Reservation
            </a>
          ) : (
            "Reservation Not Available"
          )}
        </p>
      </CardContent>
    </Card>
  );
};

//list all restaurant using RestaurantCard component

const RestaurantList = ({ restaurants }) => {
  const [favorites, setFavorites] = useState([]);

  // Fetch user's favorites when component mounts
  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return; // Don't fetch for guests

      try {
        const res = await fetch("http://localhost:8000/users/favorites", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setFavorites(data || []);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    fetchFavorites();
  }, []);

  const toggleFavorite = async (restaurant) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please sign in to save favorites");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/users/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ restaurant }),
      });
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error("Error updating favorites:", error);
    }
  };

  return (
    <Box className="restaurant-list">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant._id}
          restaurant={restaurant}
          userFavorites={favorites}
          onToggleFavorite={toggleFavorite}
        />
      ))}
    </Box>
  );
};

export default RestaurantList;
