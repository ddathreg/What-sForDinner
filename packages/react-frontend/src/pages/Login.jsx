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
import "../CSS/Login.css"; // <-- Import the new CSS file

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
      const response = await fetch(
        `https://whatsfordinner-cwdyeqbfaabyhgbr.westus-01.azurewebsites.net/users/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            passwd: password,
          }),
        },
      );

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
        <Box className="login-root">
            <Typography variant="h3" className="login-title">
                What's For Dinner
            </Typography>
            <Typography variant="h4" className="login-subtitle">
                {isSignUp ? "Create an Account" : "Sign In"}
            </Typography>
            <form onSubmit={handleSubmit} className="login-form">
                <TextField
                    required
                    fullWidth
                    label="Username"
                    variant="outlined"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="login-textfield"
                />
                <TextField
                    required
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-textfield"
                />
                {errorMessage && (
                    <Typography className="login-error">{errorMessage}</Typography>
                )}
                <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    className="login-submit"
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
                    className="login-link"
                >
                    {isSignUp ? "Sign In" : "Create an Account"}
                </Link>
            </Typography>
            <Button
                fullWidth
                variant="outlined"
                onClick={handleGuestAccess}
                className="login-guest"
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
