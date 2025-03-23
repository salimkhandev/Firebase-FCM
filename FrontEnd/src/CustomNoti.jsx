import React, { useEffect, useState } from 'react';

function CustomNoti() {
    const [tokens, setTokens] = useState([]);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = 'http://localhost:3000';

    // Fetch tokens from API
    useEffect(() => {
        const fetchTokens = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Check if server is running
                const response = await fetch(`${API_URL}/get-tokens`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

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
        setStatus('Sending notifications...');

        try {
            // Send notification to each token
            for (const tokenData of tokens) {
                const response = await fetch(`${API_URL}/send-notification`, {
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

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (!data.success) {
                    console.error('Failed to send to token:', tokenData.token);
                }
            }

            setStatus(`Notifications sent to ${tokens.length} devices!`);
            setTitle('');
            setMessage('');
        } catch (error) {
            console.error('Error details:', error);
            setStatus('Error sending notifications: ' + error.message);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h2>Send Notification to All Devices</h2>
            <p>Number of registered devices: {tokens.length}</p>
            
            <form onSubmit={handleSubmit}>
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
                            {token.token}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default CustomNoti;