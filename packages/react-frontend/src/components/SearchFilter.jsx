import React from "react";
import { Box, Button } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import {
  Restaurant,
  getRestaurantModel,
} from "../../../express-backend/models/restaurant.js";
import { useState, useEffect } from "react";
import "../CSS/SearchFilter.css";

const SearchBar = ({ filters, setFilters }) => {
  const handleChange = (event) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      searchQuery: event.target.value,
    }));
  };

  return (
    <TextField
      className="search-field"
      label="Search restaurant..."
      value={filters.searchQuery}
      onChange={handleChange}
    />
  );
};

const RatingDropdown = ({ filters, setFilters }) => {
  const ratingOptions = [4.5, 4, 3.5, 3, 2.5, 2];

  const handleChange = (event) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      min_rating: parseFloat(event.target.value),
    }));
  };

  return (
    <TextField
      className="rating-dropdown"
      select
      label="Minimum Rating"
      value={filters.min_rating}
      onChange={handleChange}
    >
      <MenuItem value={0}>Any</MenuItem>
      {ratingOptions.map((rating) => (
        <MenuItem key={rating} value={rating}>
          {rating} & up
        </MenuItem>
      ))}
    </TextField>
  );
};

const TypeDropdown = ({ filters, setFilters, city }) => {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    const fetchRestaurantTypes = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/restaurants/${city.toLowerCase()}`,
        );
        const data = await response.json();

        // Flatten and remove duplicates
        const uniqueTypes = [...new Set(data.flatMap((r) => r.cuisines))];
        setTypes(uniqueTypes);
      } catch (error) {
        console.error("Error fetching restaurant types:", error);
      }
    };

    if (city) fetchRestaurantTypes();
  }, [city]);

  const handleChange = (event) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      type: event.target.value,
    }));
  };

  return (
    <TextField
      className="type-dropdown"
      select
      label="Type"
      value={filters.type}
      onChange={handleChange}
    >
      <MenuItem value="">All Types</MenuItem>
      {types.map((type) => (
        <MenuItem key={type} value={type}>
          {type}
        </MenuItem>
      ))}
    </TextField>
  );
};

const PriceDropdown = ({ filters, setFilters }) => {
  const priceOptions = ["$", "$$ - $$$", "$$$$"];

  const handleChange = (event) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      price: event.target.value,
    }));
  };

  return (
    <TextField
      className="price-dropdown"
      select
      label="Price"
      value={filters.price}
      onChange={handleChange}
    >
      <MenuItem value="">Any Price</MenuItem>
      {priceOptions.map((price) => (
        <MenuItem key={price} value={price}>
          {price}
        </MenuItem>
      ))}
    </TextField>
  );
};

//combines all filter components
const SearchFilter = ({ filters, setFilters, city }) => {
  const defaultFilters = {
    searchQuery: "",
    min_rating: 0,
    type: "",
    price: "",
  };

  return (
    <Box className="search-filter-container">
      <SearchBar filters={filters} setFilters={setFilters} />
      <RatingDropdown filters={filters} setFilters={setFilters} />
      <TypeDropdown filters={filters} setFilters={setFilters} city={city} />
      <PriceDropdown filters={filters} setFilters={setFilters} />
      <Button
        onClick={() => setFilters(defaultFilters)}
      >
        Reset
      </Button>
    </Box>
  );
};

export default SearchFilter;
