import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";

const RestaurantHistory = () => {
  const [visited, setVisited] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVisited = useCallback(async () => {
    try {
      const response = await fetch(
        "https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/visited",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        },
      );
      if (response.ok) {
        const data = await response.json();
        setVisited(data);
      }
    } catch (error) {
      console.error("Error fetching visited restaurants:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and set up polling
  useEffect(() => {
    fetchVisited();
    const interval = setInterval(fetchVisited, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [fetchVisited]);

  const handleEdit = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setRating(restaurant.rating);
    setReview(restaurant.review || "");
    setOpen(true);
    setIsEditing(true);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!rating) {
      setErrorMessage("Please provide a rating");
      return;
    }

    try {
      const response = await fetch(
        "https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/visited",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({
            restaurantId: selectedRestaurant._id,
            name: selectedRestaurant.name,
            rating,
            review,
            images, // Add images to the request
          }),
        },
      );

      if (response.ok) {
        await fetchVisited();
        setOpen(false);
        setSelectedRestaurant(null);
        setRating(0);
        setReview("");
        setImages([]); // Clear images after submission
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error saving review:", error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ color: "white" }}>
        Restaurant History
      </Typography>

      {visited.map((restaurant) => (
        <Card
          key={restaurant.restaurantId}
          sx={{
            mb: 2,
            bgcolor: "rgba(51,51,51,0.9)",
            color: "white",
          }}>
          <CardContent>
            <Typography variant="h6">{restaurant.name}</Typography>
            <Rating value={restaurant.rating} readOnly />
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {new Date(restaurant.visitDate).toLocaleDateString()}
            </Typography>
            {restaurant.review && (
              <Typography variant="body1" sx={{ mt: 1 }}>
                {restaurant.review}
              </Typography>
            )}
            {/* Add image gallery */}
            {restaurant.images && restaurant.images.length > 0 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mt: 2,
                  flexWrap: "wrap",
                }}>
                {restaurant.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Review photo ${index + 1}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "4px",
                    }}
                  />
                ))}
              </Box>
            )}
            <Button
              onClick={() => handleEdit(restaurant)}
              sx={{
                mt: 1,
                color: "white",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
              }}>
              Edit Review
            </Button>
          </CardContent>
        </Card>
      ))}

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          setIsEditing(false);
          setRating(0);
          setReview("");
          setImages([]);
        }}>
        <DialogTitle sx={{ bgcolor: "#333", color: "white" }}>
          {isEditing ? "Edit Review" : "Add Review"} for{" "}
          {selectedRestaurant?.name}
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "#333" }}>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            sx={{ mt: 2, color: "gold" }}
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            label="Your Review"
            error={review.length > 300}
            helperText={`${review.length}/300 characters ${errorMessage ? `- ${errorMessage}` : ""}`}
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

          {/* Add image upload section */}
          <Box sx={{ mt: 2 }}>
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
                variant="outlined">
                Add Photos
              </Button>
            </label>
          </Box>

          {/* Image preview */}
          {images.length > 0 && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                mt: 2,
                flexWrap: "wrap",
              }}>
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
                    }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: "#333" }}>
          <Button
            onClick={() => {
              setOpen(false);
              setIsEditing(false);
              setRating(0);
              setReview("");
            }}
            sx={{ color: "white" }}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{
              bgcolor: "#4CAF50",
              "&:hover": { bgcolor: "#45a049" },
            }}>
            {isEditing ? "Update Review" : "Submit Review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RestaurantHistory;
