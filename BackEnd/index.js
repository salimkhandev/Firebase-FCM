const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
// import db
const pool = require('./config/dbconfig.js');
require('dotenv').config();
const app = express();

// Enable CORS with specific options
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
}));
app.use(express.json());

// Initialize Firebase Admin with environment variables

try {

    admin.initializeApp({
        credential: admin.credential.cert({
            
            projectId: process.env.PROJECT_ID,
            clientEmail: process.env.CLIENT_EMAIL,
            privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"), // Handle newlines properly
        })
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
}

app.post('/send-notification', async (req, res) => {
    const { token, title, body, imageUrl, badgeUrl } = req.body;


    try {
        const message = {
            notification: {
                title: title,
                body: body,
                image: imageUrl,
            },
            webpush: {
                notification: {
                    badge: badgeUrl,
                    icon: badgeUrl
                }
            },
            token: token
        };


        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        res.status(200).json({ success: true, response });

  
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
app.get('/', (req, res) => {
    res.send('Hello World');
});
app.post('/save-token', async (req, res) => {
    const { token } = req.body;
    const saveResponse = await pool.query('INSERT INTO fcm_tokens (token) VALUES ($1)', [token]);
    console.log('Successfully saved response:', saveResponse);
    res.status(200).json({ success: true, response: saveResponse });
});
// get all tokens
app.get('/get-tokens', async (req, res) => {
    const tokens = await pool.query('SELECT * FROM fcm_tokens');
    console.log('Successfully got tokens:', tokens);
    res.status(200).json({ success: true, tokens: tokens.rows });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});