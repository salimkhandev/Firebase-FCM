import { onMessage } from "firebase/messaging";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomNoti from "./CustomNoti";
import { generateToken, messaging } from "./notifications/firebase";

const App = () => {
    const [token, setToken] = useState(null);

    useEffect(() => {
        const saveTokenToServer = async (token) => {
            try {
                await fetch('https://firebase-fcm2-backend.vercel.app/save-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ token: token })
                });
            } catch (error) {
                // Silently handle error
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
                // Silently handle error
            }
        };

        initializeToken();

        // Only show toast for actual notifications
        const unsubscribe = onMessage(messaging, (payload) => {
            toast(
                <div className="flex flex-col">
                    <h4 className="font-bold text-gray-800">{payload.notification.title}</h4>
                    <p className="text-gray-600">{payload.notification.body}</p>
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
                    autoClose: 4000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    className: 'bg-white shadow-lg border-l-4 border-blue-500',
                }
            );
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <ToastContainer 
                position="top-right"
                autoClose={4000}
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
