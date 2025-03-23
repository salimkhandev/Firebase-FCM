const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const pool = require('../config/dbconfig');

// Get all tokens
router.get('/get-tokens', async (req, res) => {
    try {
        const tokens = await pool.query('SELECT * FROM fcm_tokens');
        console.log('Successfully got tokens:', tokens);
        res.status(200).json({ success: true, tokens: tokens.rows });
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/save-token', async (req, res) => {
    const { token, device_id } = req.body;  // Send `device_id` from frontend

    try {
        // Check if the device already exists
        await pool.query(
            `INSERT INTO fcm_tokens (device_id, token)
             VALUES ($1, $2)
             ON CONFLICT (device_id) DO UPDATE SET token = EXCLUDED.token`,
            [device_id, token]
        );

        res.status(201).json({ success: true, message: 'Token updated successfully' });
    } catch (error) {
        console.error('Error saving token:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});



// Send notification
router.post('/send-notification', async (req, res) => {
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

module.exports = router; 