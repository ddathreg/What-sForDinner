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
      sx={{
        position: "relative",
        width: "300px",
        margin: "1rem",
        overflow: "hidden",
        transition: "transform 0.3s",
        "&:hover": {
          transform: "scale(1.03)",
        },
      }}
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
              zIndex: 2,
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
              color: "white",
              zIndex: 2,
              "&:hover": { color: "gold" },
            }}
            onClick={() => onToggleFavorite(restaurant)}
          />
        ))}

      <CardHeader title={restaurant.name} />

      <div className="restaurant-image">
        {restaurant.featured_image ? (
          <img
            src={restaurant.featured_image}
            alt={`${restaurant.name} image`}
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        ) : (
          <div style={{ color: "gray", textAlign: "center", padding: "1rem" }}>
            No image available
          </div>
        )}
      </div>

      {/* Hover details */}
      <CardContent
        className="hover-details"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          backgroundColor: "rgba(0,0,0,0.85)",
          color: "white",
          opacity: hover ? 1 : 0,
          pointerEvents: hover ? "auto" : "none",
          transition: "opacity 0.3s ease",
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        <p>
          <strong>Website: </strong>
          {restaurant.link ? (
            <a
              href={restaurant.link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4dabf7" }}
            >
              Visit Website
            </a>
          ) : (
            "Unknown"
          )}
        </p>
        <p>
          <strong>Cuisines: </strong>
          {restaurant.cuisines.length > 0
            ? restaurant.cuisines.join(", ")
            : "NA"}
        </p>
        <p>
          <strong>Price Range: </strong>
          {restaurant.price_range_usd || "NA"}
        </p>
        <p>
          <strong>Average Rating: </strong>
          {restaurant.rating || "NA"}
        </p>
        <p>
          <strong>Reviews: </strong>
          {restaurant.reviews || "NA"}
        </p>
        <p>
          <strong>Has Delivery: </strong>
          {restaurant.has_delivery ? "Yes" : "No"}
        </p>
        <p>
          <strong>Menu: </strong>
          {restaurant.menu_link ? (
            <a
              href={restaurant.menu_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4dabf7" }}
            >
              View Menu
            </a>
          ) : (
            "Not Available"
          )}
        </p>
        <p>
          <strong>Reservation: </strong>
          {restaurant.reservation_link ? (
            <a
              href={restaurant.reservation_link}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#4dabf7" }}
            >
              Make a Reservation
            </a>
          ) : (
            "Not Available"
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
