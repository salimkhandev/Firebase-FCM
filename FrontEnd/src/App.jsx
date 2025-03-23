import { onMessage } from "firebase/messaging";
import { useEffect, useState } from "react";
import CustomNoti from "./CustomNoti";
import { generateToken, messaging } from "./notifications/firebase";

const App = () => {
    const [token, setToken] = useState(null);
    const [saveStatus, setSaveStatus] = useState('');

    useEffect(() => {
        const saveTokenToServer = async (token) => {
            try {
                const response = await fetch('https://firebase-fcm2-backend.vercel.app/save-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: token })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.success) {
                    setSaveStatus('Token saved successfully!');
                    console.log('Token saved to database');
                } else {
                    throw new Error('Failed to save token');
                }
            } catch (error) {
                console.error('Error saving token:', error);
                setSaveStatus('Failed to save token: ' + error.message);
            }
        };

        const initializeToken = async () => {
            try {
                const storedToken = localStorage.getItem('token');
                if (storedToken) {
                    setToken(storedToken);
                    await saveTokenToServer(storedToken);
                } else {
                    const newToken = await generateToken();
                    if (newToken) {
                        setToken(newToken);
                        localStorage.setItem('token', newToken);
                        await saveTokenToServer(newToken);
                    }
                }
            } catch (error) {
                console.error('Error initializing token:', error);
                setSaveStatus('Error initializing token: ' + error.message);
            }
        };

        initializeToken();

        onMessage(messaging, (payload) => {
            console.log('Message received. ', payload);
        });
    }, []);

    const handleCopyToken = () => {
        navigator.clipboard.writeText(token);
        alert('Token copied to clipboard!');
    };

    return (
        <div>
            <h1>Push Notification</h1>
            <button onClick={handleCopyToken}>Copy Token</button>
            <p>Token: {token}</p>
            {saveStatus && <p>{saveStatus}</p>}
            <button onClick={generateToken}>Generate Token</button>
            <CustomNoti />
        </div>
    );
};

export default App;