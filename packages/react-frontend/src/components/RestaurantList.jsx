import React, { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import "../CSS/RestaurantList.css";

//create RestaurantCard component
const RestaurantCard = ({ restaurant, userFavorites, onToggleFavorite, onVisitStatusChange }) => {
  const [hover, setHover] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const isFavorited = userFavorites.some((fav) => fav.name === restaurant.name);

  const checkVisitedStatus = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await fetch("https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/visited", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const visited = await response.json();
        const isVisitedRestaurant = visited.some(
          (v) => v.restaurantId === restaurant._id || v.name === restaurant.name
        );
        setIsVisited(isVisitedRestaurant);
      }
    } catch (error) {
      console.error("Error checking visited status:", error);
    }
  };

  // Check visited status on mount and when changes occur
  useEffect(() => {
    checkVisitedStatus();
  }, [restaurant._id, restaurant.name]);

  const handleMarkAsVisited = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please sign in to mark restaurants as visited");
      return;
    }
    setShowReviewDialog(true);
  };

  const handleReviewSubmitted = () => {
    setIsVisited(true);
    if (onVisitStatusChange) {
      onVisitStatusChange();
    }
    checkVisitedStatus(); // Refresh visited status
  };

  return (
    <>
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
        {/* Add Visited Icon */}
        {(hover || isVisited) && (
          <Box sx={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}>
            {isVisited ? (
              <CheckCircleIcon
                sx={{
                  color: "#4CAF50",
                  cursor: "pointer",
                  fontSize: "28px",
                }}
                onClick={handleMarkAsVisited}
              />
            ) : (
              <CheckCircleOutlineIcon
                sx={{
                  color: "white",
                  cursor: "pointer",
                  fontSize: "28px",
                  "&:hover": {
                    color: "#4CAF50",
                  },
                }}
                onClick={handleMarkAsVisited}
              />
            )}
          </Box>
        )}

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
            <div
              style={{
                color: "gray",
                textAlign: "center",
                padding: "1rem",
              }}
            >
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

      <ReviewDialog
        open={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
        restaurant={restaurant}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </>
  );
};

// Update the ReviewDialog component to handle the onReviewSubmitted callback
const ReviewDialog = ({ open, onClose, restaurant, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [error, setError] = useState("");
  const [images, setImages] = useState([]); // Add state for images
  const [imageError, setImageError] = useState(""); // Add this line

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 800; // max width/height in pixels
    const maxFileSize = 5 * 1024 * 1024; // 5MB in bytes

    files.forEach((file) => {
      // Check file size
      if (file.size > maxFileSize) {
        setImageError(`Image "${file.name}" is too large. Maximum size is 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Check dimensions
          if (img.width > 4000 || img.height > 4000) {
            setImageError(`Image "${file.name}" dimensions are too large. Maximum dimensions are 4000x4000 pixels.`);
            return;
          }

          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          // Clear any previous errors when successful
          setImageError("");
          const compressedImage = canvas.toDataURL("image/jpeg", 0.7);
          setImages((prev) => [...prev, compressedImage]);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please provide a rating");
      return;
    }

    try {
      const response = await fetch("https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/visited", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({
          restaurantId: restaurant._id,
          name: restaurant.name,
          rating,
          review,
          images, // Include images in the request
        }),
      });

      if (response.ok) {
        onClose();
        setRating(0);
        setReview("");
        setImages([]); // Clear images
        onReviewSubmitted();
      } else {
        setError("Failed to save review");
      }
    } catch (error) {
      console.error("Error saving review:", error);
      setError("Failed to save review");
    }
  };

  const handleClose = () => {
    onClose();
    setRating(0);
    setReview("");
    setImages([]);
    setError("");
    setImageError(""); // Add this line
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#333",
          color: "white",
        },
      }}
    >
      <DialogTitle>{restaurant?.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography component="legend" sx={{ color: "white" }}>
            Your Rating
          </Typography>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
            sx={{ color: "gold" }}
          />
        </Box>
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Your Review (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          error={review.length > 300}
          helperText={`${
            review.length
          }/300 characters ${error ? `- ${error}` : ""}`}
          sx={{
            mt: 2,
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(255,255,255,0.1)",
              color: "white",
              "& fieldset": {
                borderColor: "rgba(255,255,255,0.3)",
              },
              "&:hover fieldset": {
                borderColor: "rgba(255,255,255,0.5)",
              },
              "&.Mui-focused fieldset": {
                borderColor: "white",
              },
            },
            "& .MuiInputLabel-root": {
              color: "rgba(255,255,255,0.7)",
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: "white",
            },
          }}
        />

        {/* Add error message display */}
        {imageError && (
          <Typography
            color="error"
            sx={{
              mt: 2,
              mx: 3,
              backgroundColor: "rgba(255,0,0,0.1)",
              padding: "8px",
              borderRadius: "4px",
              fontSize: "0.875rem"
            }}
          >
            {imageError}
          </Typography>
        )}

        {/* Image Upload Section */}
        <Box sx={{ mt: 2, mx: 3 }}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ display: "none" }}
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              component="span"
              startIcon={<AddPhotoAlternateIcon />}
              sx={{
                color: "white",
                borderColor: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}
              variant="outlined"
            >
              Add Photos
            </Button>
          </label>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              color: "rgba(255,255,255,0.7)"
            }}
          >
            Maximum file size: 5MB. Supported formats: JPG, PNG
          </Typography>
        </Box>

        {/* Image Preview */}
        {images.length > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              mt: 2,
              flexWrap: "wrap",
            }}
          >
            {images.map((img, index) => (
              <Box key={index} sx={{ position: "relative" }}>
                <img
                  src={img}
                  alt={`Upload preview ${index + 1}`}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "4px",
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveImage(index)}
                  sx={{
                    position: "absolute",
                    top: -10,
                    right: -10,
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "white",
                    "&:hover": {
                      bgcolor: "rgba(255,0,0,0.7)",
                    },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ bgcolor: "#333" }}>
        <Button onClick={handleClose} sx={{ color: "white" }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: "#4CAF50",
            "&:hover": { bgcolor: "#45a049" },
          }}
        >
          Submit Review
        </Button>
      </DialogActions>
    </Dialog>
  );
};

//list all restaurant using RestaurantCard component

const RestaurantList = ({ restaurants, onFavoriteToggle, onVisitStatusChange }) => {
  const [favorites, setFavorites] = useState([]);

  const fetchFavorites = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const res = await fetch("https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/favorites", {
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

  const toggleFavorite = async (restaurant) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please sign in to save favorites");
      return;
    }

    try {
      const response = await fetch("https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ restaurant }),
      });
      if (response.ok) {
        await fetchFavorites();
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  return (
    <Box className="restaurant-list">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          key={restaurant._id || restaurant.name}
          restaurant={restaurant}
          userFavorites={favorites}
          onToggleFavorite={async (r) => {
            await toggleFavorite(r);
            if (onFavoriteToggle) {
              onFavoriteToggle();
            }
          }}
          onVisitStatusChange={onVisitStatusChange}
        />
      ))}
    </Box>
  );
};

export default RestaurantList;
