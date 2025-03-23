import React, { useEffect, useState } from 'react';

function CustomNoti() {
    const [tokens, setTokens] = useState([]);
    const [selectedToken, setSelectedToken] = useState('');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_URL = 'https://firebase-fcm2-backend.vercel.app';
   

    // Fetch tokens from API
    useEffect(() => {
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
                    imageUrl: "https://example.com/default-image.jpg",
                    badgeUrl: "https://example.com/default-badge.png"
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
                        imageUrl: "https://example.com/default-image.jpg",
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Send Notification</h2>
            <p>Number of registered devices: {tokens.length}</p>
            
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Select Device:</label>
                    <select 
                        value={selectedToken} 
                        onChange={(e) => setSelectedToken(e.target.value)}
                        required
                    >
                        <option value="">Select a device</option>
                        {tokens.map((token, index) => (
                            <option key={index} value={token.token}>
                                Device {index + 1}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label>Title:</label>
                    <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Message:</label>
                    <textarea 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={!selectedToken || loading}
                >
                    Send to Selected Device
                </button>

                <button 
                    type="button" 
                    onClick={handleSendToAll}
                    disabled={tokens.length === 0 || loading}
                >
                    Send to All Devices
                </button>
            </form>

            {status && <p>{status}</p>}

            <div>
                <h3>Stored Tokens ({tokens.length}):</h3>
                <ul>
                    {tokens.map((token, index) => (
                        <li key={index} style={{ wordBreak: 'break-all', marginBottom: '10px' }}>
                            Device {index + 1}: {token.token}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default CustomNoti;