const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey/serviceAccountKey.json'); // Update the path

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/send-notification', async (req, res) => {
    const { token, title, body, imageUrl, badgeUrl } = req.body; // Add imageUrl to the request


    try {
        const message = {
            notification: {
                title: title,
                body: body,
                image: imageUrl, 
            },
            data: {
                badge: badgeUrl, // Add badge URL to the data payload
            },
            token: token,
        };

        const response = await admin.messaging().send(message);
        res.status(200).send({ success: true, response });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
