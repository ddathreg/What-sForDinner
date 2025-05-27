import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Link,
    Snackbar,
    Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Password must be at least 8 characters, include uppercase, lowercase, number, and special char
const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const Login = ({ setIsAuthenticated }) => {
    const [isSignUp, setIsSignUp] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (isSignUp && !validatePassword(password)) {
      setErrorMessage(
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character."
      );
      return;
    }

    try {
      const endpoint = isSignUp ? "signup" : "login";
      const response = await fetch(`http://localhost:8000/users/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          passwd: password,
        }),
      });

            // Add debugging
            console.log("Response status:", response.status);

            const data = await response.text();
            console.log("Response data:", data);

            if (response.ok) {
                localStorage.setItem("authToken", data);
                localStorage.removeItem("isGuest");
                setIsAuthenticated(true);
                setShowSuccess(true);
                setTimeout(() => {
                    navigate("/");
                }, 1000);
            } else {
                setErrorMessage(data || "Authentication failed");
            }
        } catch (error) {
            console.error("Authentication error:", error);
            setErrorMessage("Network error. Please try again.");
        }
    };

    const handleGuestAccess = () => {
        localStorage.setItem("isGuest", "true");
        localStorage.removeItem("authToken"); // Remove any existing auth token
        setIsAuthenticated(true);
        navigate("/");
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                bgcolor: "black",
                color: "white",
                padding: 2,
            }}
        >
            <Typography variant="h3" sx={{ mb: 3, fontWeight: "bold" }}>
                What's For Dinner
            </Typography>
            <Typography variant="h4" sx={{ mb: 3 }}>
                {isSignUp ? "Create an Account" : "Sign In"}
            </Typography>
            <form
                onSubmit={handleSubmit}
                style={{ width: "100%", maxWidth: "400px" }}
            >
                <TextField
                    required
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ mb: 2, bgcolor: "white" }}
                />
                <TextField
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ mb: 2, bgcolor: "white" }}
                />
                {errorMessage && (
                    <Typography sx={{ color: "red", mb: 2 }}>{errorMessage}</Typography>
                )}
                <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    sx={{ bgcolor: "#1976d2", "&:hover": { bgcolor: "#115293" }, mb: 2 }}
                >
                    {isSignUp ? "Sign Up" : "Sign In"}
                </Button>
            </form>
            <Typography>
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <Link
                    component="button"
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setErrorMessage("");
                    }}
                    sx={{ color: "#1976d2", cursor: "pointer" }}
                >
                    {isSignUp ? "Sign In" : "Create an Account"}
                </Link>
            </Typography>
            <Button
                fullWidth
                variant="outlined"
                onClick={handleGuestAccess}
                sx={{
                    mt: 3,
                    color: "white",
                    borderColor: "white",
                    "&:hover": { bgcolor: "#333", borderColor: "white" },
                }}
            >
                Continue as Guest
            </Button>

            <Snackbar
                open={showSuccess}
                autoHideDuration={2000}
                onClose={() => setShowSuccess(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setShowSuccess(false)}
                    severity="success"
                    sx={{ width: "100%" }}
                >
                    {isSignUp ? "Account created successfully!" : "Login successful!"}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Login;
