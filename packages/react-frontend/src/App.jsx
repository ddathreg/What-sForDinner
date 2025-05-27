import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Restaurants from "./pages/Restaurants";
import Favorites from "./pages/Favorites";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import { Button } from "@mui/material";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("authToken");
      const isGuest = localStorage.getItem("isGuest") === "true";

      if (token) {
        try {
          // const response = await fetch("http://localhost:8000/users/verify", {
          const response = await fetch("whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem("authToken");
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Token verification error:", error);
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(isGuest);
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Helper for restricted pages
  const SignInPrompt = ({ message }) => (
    <div style={{ textAlign: "center", marginTop: "100px", color: "white" }}>
      <h2>{message}</h2>
      <Button
        variant="contained"
        onClick={() => (window.location.href = "/login")}
        sx={{
          mt: 2,
          bgcolor: "#1976d2",
          "&:hover": { bgcolor: "#115293" },
        }}
      >
        Sign In
      </Button>
    </div>
  );

  return (
    <Router>
      <div>
        <NavBar
          isAuthenticated={isAuthenticated}
          setIsAuthenticated={setIsAuthenticated}
        />
        <Routes>
          <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/" element={<Home />} />
          <Route path="/restaurants" element={<Restaurants />} />
          <Route
            path="/favorites"
            element={
              isAuthenticated && localStorage.getItem("authToken") ? (
                <Favorites />
              ) : (
                <SignInPrompt message="Please sign in to view favorites" />
              )
            }
          />
          <Route
            path="/profile"
            element={
              isAuthenticated && localStorage.getItem("authToken") ? (
                <Profile />
              ) : (
                <SignInPrompt message="Please sign in to view your profile" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
