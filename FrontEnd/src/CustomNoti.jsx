import React, { useEffect, useState } from 'react';

function CustomNoti() {
    const [tokens, setTokens] = useState([]);
    const [selectedToken, setSelectedToken] = useState('');
    const [title, setTitle] = useState('Test Notification');
    const [message, setMessage] = useState('This is a test notification message. Hello!');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentDeviceToken, setCurrentDeviceToken] = useState('');
    const API_URL = 'https://firebase-fcm2-backend.vercel.app';
   

    // Fetch tokens from API
    useEffect(() => {
        // Get current device token from localStorage
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setCurrentDeviceToken(storedToken);
        }

        const fetchTokens = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Check if server is running
                const response = await fetch(`${API_URL}/get-tokens`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                setTokens(data.tokens || []);
                console.log('Fetched tokens:', data.tokens);
            } catch (error) {
                console.error('Error fetching tokens:', error);
                setError(error.message === 'Failed to fetch' 
                    ? 'Unable to connect to server. Please make sure the backend is running.'
                    : error.message
                );
            } finally {
                setLoading(false);
            }
        };

        fetchTokens();
    }, []);

    // Send notification
    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Sending notification...');

        try {
            const response = await fetch(`${API_URL}/send-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: selectedToken,
                    title: title,
                    body: message,
                    imageUrl: "https://www.shutterstock.com/image-vector/fired-rubber-stamp-seal-vector-260nw-2406578221.jpg",
                    badgeUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZSwQ-a_hsZqk7ZoWU0n5iXBmN4leE1-NDuw&s"
                    // badgeUrl: "https://cdn-icons-png.flaticon.com/512/4658/4658667.png"
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.success) {
                setStatus('Notification sent successfully!');
                setTitle('');
                setMessage('');
            } else {
                throw new Error('Failed to send notification');
            }
        } catch (error) {
            console.error('Error details:', error);
            setStatus('Error sending notification: ' + error.message);
        }
    };

    const handleSendToAll = async () => {
        setStatus('Sending notifications to all devices...');

        try {
            for (const tokenData of tokens) {
                await fetch(`${API_URL}/send-notification`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: tokenData.token,
                        title: title,
                        body: message,
                        imageUrl: "https://www.shutterstock.com/image-vector/fired-rubber-stamp-seal-vector-260nw-2406578221.jpg",
                        badgeUrl: "https://cdn-icons-png.flaticon.com/512/4658/4658667.png"
                    })
                });
            }
            setStatus(`Notifications sent to all ${tokens.length} devices!`);
            setTitle('');
            setMessage('');
        } catch (error) {
            setStatus('Error sending notifications: ' + error.message);
        }
    };

    const handleSendToMyDevice = async () => {
        if (!currentDeviceToken) {
            setStatus('Current device token not found');
            return;
        }
        setSelectedToken(currentDeviceToken);
        await handleSubmit(new Event('submit'));
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            Error: {error}
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Send Notification</h2>
                
                {/* Quick Actions */}
                <div className="mb-6 space-y-4">
                    {currentDeviceToken && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-blue-800">Your Device</h3>
                                    <p className="text-xs text-gray-600 mt-1">Send a notification directly to this device</p>
                                </div>
                                <button 
                                    onClick={handleSendToMyDevice}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-sm"
                                >
                                    Send to My Device
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                    <p className="text-blue-800">
                        Registered devices: 
                        <span className="font-semibold ml-2">{tokens.length}</span>
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Select Device
                        </label>
                        <select 
                            value={selectedToken} 
                            onChange={(e) => setSelectedToken(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a device</option>
                            {tokens.map((token, index) => (
                                <option 
                                    key={index} 
                                    value={token.token}
                                    className={token.token === currentDeviceToken ? 'font-bold' : ''}
                                >
                                    {token.token === currentDeviceToken 
                                        ? `This Device (Device ${index + 1})`
                                        : `Device ${index + 1}`}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input 
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter notification title"
                        />
                        {/* Quick title suggestions */}
                        <div className="flex gap-2 mt-2">
                            <button 
                                type="button"
                                onClick={() => setTitle('🔔 New Alert')}
                                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                            >
                                🔔 New Alert
                            </button>
                            <button 
                                type="button"
                                onClick={() => setTitle('📢 Important Update')}
                                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                            >
                                📢 Important Update
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Message
                        </label>
                        <textarea 
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter notification message"
                        />
                        {/* Quick message suggestions */}
                        <div className="flex gap-2 mt-2">
                            <button 
                                type="button"
                                onClick={() => setMessage('👋 Hey there! This is a quick test notification.')}
                                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                            >
                                Quick Hello
                            </button>
                            <button 
                                type="button"
                                onClick={() => setMessage('🎉 Great news! Your test notification system is working perfectly!')}
                                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                            >
                                Success Message
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button 
                            type="submit" 
                            disabled={!selectedToken || loading}
                            className={`flex-1 px-4 py-2 rounded-md text-white font-medium ${
                                !selectedToken || loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                            }`}
                        >
                            Send to Selected Device
                        </button>

                        <button 
                            type="button" 
                            onClick={handleSendToAll}
                            disabled={tokens.length === 0 || loading}
                            className={`flex-1 px-4 py-2 rounded-md text-white font-medium ${
                                tokens.length === 0 || loading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                            }`}
                        >
                            Send to All Devices
                        </button>
                    </div>
                </form>

                {status && (
                    <div className={`mt-4 p-4 rounded-lg ${
                        status.includes('Error') 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                    }`}>
                        {status}
                    </div>
                )}

                {/* Tokens list with current device highlighted */}
                <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">
                        Registered Devices ({tokens.length})
                    </h3>
                    <div className="space-y-3">
                        {tokens.map((token, index) => (
                            <div 
                                key={index} 
                                className={`p-4 rounded-lg break-all ${
                                    token.token === currentDeviceToken 
                                        ? 'bg-blue-50 border border-blue-200' 
                                        : 'bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    {token.token === currentDeviceToken && (
                                        <span className="px-2 py-1 text-xs bg-blue-200 text-blue-800 rounded-full">
                                            Current Device
                                        </span>
                                    )}
                                    <span className="font-semibold text-blue-600">Device {index + 1}</span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">{token.token}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CustomNoti;