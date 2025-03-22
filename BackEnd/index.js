const express = require('express');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin with environment variables
const app = express();

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

app.use(express.json());

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});