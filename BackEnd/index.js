const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
// import db
const { pool } = require('./config/dbconfig');
require('dotenv').config();
const app = express();

// Enable CORS with specific options
app.use(cors({
    origin: ['http://localhost:5173', 'https://firebase-fcm2.vercel.app/'],
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
    try {
        // First check if token already exists
        const existingToken = await pool.query(
            'SELECT * FROM fcm_tokens WHERE token = $1',
            [token]
        );

        if (existingToken.rows.length > 0) {
            // Token exists, update it
            await pool.query(
                'UPDATE fcm_tokens SET user_id = $1 WHERE token = $2',
                [1, token] // Using 1 as default user_id
            );
        } else {
            // Token doesn't exist, insert new
            await pool.query(
                'INSERT INTO fcm_tokens (user_id, token) VALUES ($1, $2)',
                [1, token] // Using 1 as default user_id
            );
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error saving token:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// get all tokens
app.get('/get-tokens', async (req, res) => {
    try {
        const tokens = await pool.query('SELECT * FROM fcm_tokens');
        console.log('Successfully got tokens:', tokens);
        res.status(200).json({ success: true, tokens: tokens.rows });
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});