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
    const [imageUrl, setImageUrl] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [useDefaultImage, setUseDefaultImage] = useState(true);

    const DEFAULT_IMAGE = "https://www.shutterstock.com/image-vector/fired-rubber-stamp-seal-vector-260nw-2406578221.jpg";

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

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                alert('Image size should be less than 1MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                setImageUrl(reader.result);
                setUseDefaultImage(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImageUrl('');
        setPreviewImage('');
        setUseDefaultImage(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('Sending notification...');

        try {
            await fetch(`${API_URL}/send-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: selectedToken,
                    title: title,
                    body: message,
                    imageUrl: useDefaultImage ? DEFAULT_IMAGE : (imageUrl || null),
                    badgeUrl: "https://cdn-icons-png.flaticon.com/512/4658/4658667.png"
                })
            });
            
            setTitle('');
            setMessage('');
            setStatus('Notification sent successfully!');
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
                        imageUrl: useDefaultImage ? DEFAULT_IMAGE : (imageUrl || null),
                        badgeUrl: "https://example.com/default-badge.png"
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

                    {/* Image Selection Section */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Notification Image (Optional)
                        </label>
                        
                        {/* Image Options */}
                        <div className="space-y-4">
                            {/* Default Image Option */}
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    id="useDefaultImage"
                                    checked={useDefaultImage}
                                    onChange={(e) => setUseDefaultImage(e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="useDefaultImage" className="text-sm text-gray-600">
                                    Use default image
                                </label>
                            </div>

                            {/* Default Image Preview */}
                            {useDefaultImage && (
                                <div className="mt-2">
                                    <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                            src={DEFAULT_IMAGE}
                                            alt="Default"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Default notification image
                                    </p>
                                </div>
                            )}

                            {/* Custom Image Upload */}
                            {!useDefaultImage && (
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-4">
                                        <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                            <span>{imageUrl ? 'Change Image' : 'Upload Custom Image'}</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                        {imageUrl && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>

                                    {/* Custom Image Preview */}
                                    {previewImage && (
                                        <div className="mt-2">
                                            <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-200">
                                                <img
                                                    src={previewImage}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Custom notification image
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
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