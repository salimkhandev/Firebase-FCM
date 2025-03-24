import { onMessage } from "firebase/messaging";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
                // toast.success("Token saved successfully!");
                // setSaveStatus("Token saved successfully!");
            } else {
                throw new Error("Failed to save token");
            }
        } catch (error) {
            // console.error("Error saving token:", error);
            // toast.error("Failed to save token: " + error.message);
            // setSaveStatus("Failed to save token: " + error.message);
        }
    };

    // 🔹 Initialize token on mount
    useEffect(() => {
        handleGenerateToken();
        const initializeToken = async () => {
            try {
                const storedToken = localStorage.getItem("token");
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
                // toast.error("Error initializing token: " + error.message);
                // setSaveStatus("Error initializing token: " + error.message);
            }
        };

        initializeToken();

        // 🔹 Listen for incoming messages
        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Message received in foreground. ", payload);
            
            // Show toast notification
            toast.info(
                <div>
                    <h4 className="font-bold">{payload.notification.title}</h4>
                    <p>{payload.notification.body}</p>
                    {payload.notification.image && (
                        <img 
                            src={payload.notification.image} 
                            alt="Notification" 
                            className="mt-2 rounded-lg max-h-32"
                        />
                    )}
                </div>,
                {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                }
            );
        });

        return () => unsubscribe();
    }, []);

    // 🔹 Generate & save new token on button click
    const handleGenerateToken = async () => {
        try {
            const newToken = await generateToken();
            if (newToken) {
                setToken(newToken);
                localStorage.setItem("token", newToken);
                await saveTokenToServer(newToken);
                toast.success("New token generated!");
            }
        } catch (error) {
            console.error("Error generating token:", error);
            toast.error("Error generating token: " + error.message);
        }
    };


    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <ToastContainer 
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            
            <div className="max-w-4xl mx-auto">
                
                <CustomNoti />
            </div>
        </div>
    );
};

export default App;
