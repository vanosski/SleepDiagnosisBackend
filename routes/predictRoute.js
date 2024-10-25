const express = require('express');
const { predict } = require('../models/model'); // Adjust path as needed
const router = express.Router();

router.post('/predict', async (req, res) => {
    try {
        const { duration, activity, stress } = req.body;

        if (duration == null || activity == null || stress == null) {
            return res.status(400).json({ message: 'Missing input parameters.' });
        }

        const predictedQuality = await predict([duration, activity, stress]);
        res.status(200).json({ predictedQuality });
    } catch (error) {
        console.error('Error during prediction:', error);
        res.status(500).json({ message: 'Error making prediction.' });
    }
});

module.exports = router;
