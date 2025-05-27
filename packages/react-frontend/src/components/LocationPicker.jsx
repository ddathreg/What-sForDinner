import { useState, useEffect } from "react";

const LocationPicker = ({ token, onLocationChange }) => {
  const [selectedLocation, setSelectedLocation] = useState(
    localStorage.getItem("guestLocation") || "slo"
  );

  const locationMap = {
    "San Luis Obispo": "slo",
    "San Francisco": "sf",
    "Los Angeles": "la",
    "New York City": "nyc",
    "Chicago": "chi",
    "Miami": "mia",
    "Austin": "atx",
    "Honolulu": "hnl",
    "New Orleans": "nola",
  };

  useEffect(() => {
    const fetchCurrentLocation = async () => {
      if (token) {
        try {
          const response = await fetch("http://localhost:8000/users/location", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error(await response.text());
          const data = await response.json();
          const location = data.location || "slo";
          setSelectedLocation(location);
          onLocationChange(location);
        } catch {
          setSelectedLocation("slo");
          onLocationChange("slo");
        }
      } else {
        // Guest: use localStorage
        const guestLoc = localStorage.getItem("guestLocation") || "slo";
        setSelectedLocation(guestLoc);
        onLocationChange(guestLoc);
      }
    };
    fetchCurrentLocation();
  }, [token, onLocationChange]);

  const handleChange = async (e) => {
    const newLocation = e.target.value;
    setSelectedLocation(newLocation);
    onLocationChange(newLocation);

    if (token) {
      try {
        await fetch("http://localhost:8000/users/location", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ location: newLocation }),
        });
      } catch (error) {
        console.error("Error updating location:", error);
      }
    } else {
      // Guest: save to localStorage
      localStorage.setItem("guestLocation", newLocation);
    }
  };

  return (
    <div style={{ margin: "20px 0" }}>
      <label htmlFor="location" style={{ marginRight: "10px", color: "white" }}>
        Select Location:{" "}
      </label>
      <select
        id="location"
        value={selectedLocation}
        onChange={handleChange}
        style={{
          padding: "8px",
          borderRadius: "4px",
          backgroundColor: "#333",
          color: "white",
          border: "1px solid white",
        }}
      >
        {Object.entries(locationMap).map(([label, value]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LocationPicker;
