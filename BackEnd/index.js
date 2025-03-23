const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const notificationRoutes = require('./routes/notification.routes');

const app = express();

// Enable CORS
app.use(cors({
    origin: ['http://localhost:5173', 'https://firebase-fcm2.vercel.app/'],
    credentials: true
}));
app.use(express.json());

// Initialize Firebase Admin
try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.PROJECT_ID,
            clientEmail: process.env.CLIENT_EMAIL,
            privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
        })
    });
    console.log('Firebase Admin initialized successfully');
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
}

// Routes
app.use('/', notificationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});