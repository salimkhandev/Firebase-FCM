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
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        Push Notification Dashboard
                    </h1>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h2 className="text-lg font-semibold text-blue-800 mb-2">
                            Device Status
                        </h2>
                        <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${token ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            <p className="text-sm text-gray-600">
                                {token ? 'Device Ready' : 'Initializing...'}
                            </p>
                        </div>
                    </div>
                </div>

                <CustomNoti />
            </div>
        </div>
    );
};

export default App;
