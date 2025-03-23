import { onMessage } from "firebase/messaging";
import { useEffect, useState } from "react";
import CustomNoti from "./CustomNoti";
import { generateToken, messaging } from "./notifications/firebase";

const App = () => {
    const [token, setToken] = useState(null);
    const [saveStatus, setSaveStatus] = useState("");

    // 🔹 Generate a persistent device ID (Stored in localStorage)
    const getDeviceId = () => {
        let deviceId = localStorage.getItem("device_id");
        if (!deviceId) {
            deviceId = crypto.randomUUID(); // Generate new unique ID
            localStorage.setItem("device_id", deviceId);
        }
        return deviceId;
    };

    // 🔹 Save token to the server
    const saveTokenToServer = async (token) => {
        try {
            const response = await fetch("https://firebase-fcm2-backend.vercel.app/save-token", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, device_id: getDeviceId() }), // Use stored device_id
            });

            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

            const data = await response.json();
            if (data.success) {
                setSaveStatus("Token saved successfully! ✅");
                console.log("Token saved to database");
            } else {
                throw new Error("Failed to save token ❌");
            }
        } catch (error) {
            console.error("Error saving token:", error);
            setSaveStatus("Failed to save token: " + error.message);
        }
    };

    // 🔹 Initialize token on mount
    useEffect(() => {
        const initializeToken = async () => {
            try {
                let storedToken = localStorage.getItem("token");

                if (storedToken) {
                    setToken(storedToken);
                    await saveTokenToServer(storedToken);
                } else {
                    const newToken = await generateToken();
                    if (newToken) {
                        setToken(newToken);
                        localStorage.setItem("token", newToken);
                        await saveTokenToServer(newToken);
                    }
                }
            } catch (error) {
                console.error("Error initializing token:", error);
                setSaveStatus("Error initializing token: " + error.message);
            }
        };

        initializeToken();

        // 🔹 Listen for incoming messages
        onMessage(messaging, (payload) => {
            console.log("FCM Message received: ", payload);
        });
    }, []);

    // 🔹 Generate & save new token on button click
    const handleGenerateToken = async () => {
        try {
            const newToken = await generateToken();
            if (newToken) {
                setToken(newToken);
                localStorage.setItem("token", newToken);
                await saveTokenToServer(newToken);
            }
        } catch (error) {
            console.error("Error generating token:", error);
            alert("Failed to generate token ❌");
        }
    };

    // 🔹 Copy token to clipboard
    const handleCopyToken = () => {
        if (token) {
            navigator.clipboard.writeText(token);
            alert("Token copied to clipboard! ✅");
        }
    };

    return (
        <div>
            <h1>Push Notification 🔔</h1>
            <button onClick={handleCopyToken}>Copy Token 📋</button>
            <p>Token: {token || "Generating..."}</p>
            {saveStatus && <p>{saveStatus}</p>}
            <button onClick={handleGenerateToken}>Generate New Token 🔄</button>
            <CustomNoti />
        </div>
    );
};

export default App;
