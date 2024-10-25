const express = require('express');
const { trainModel } = require('../models/model'); // Adjust path as needed
const router = express.Router();

router.post('/train', async (req, res) => {
    try {
        const { userInfo, dailyData } = req.body;

        if (!userInfo || !dailyData) {
            return res.status(400).json({ message: 'Missing user information or daily data.' });
        }

        const totalDuration = dailyData.reduce((acc, entry) => acc + entry.duration, 0);
        const averageDuration = totalDuration / dailyData.length;

        await trainModel(dailyData); // Train the model

        // Return relevant data for the chart
        const dailyResults = dailyData.map(entry => ({
            day: entry.day, // Assuming each entry has a 'day' property
            quality: entry.quality // Use actual quality or a calculated value
        }));

        res.status(200).json({
            message: 'Training completed successfully.',
            averageDuration,
            showDiagnosis: averageDuration <= 5,
            dailyResults, // Send back daily results for the chart
        });
    } catch (error) {
        console.error('Error during training:', error);
        res.status(500).json({ message: 'Training failed.' });
    }
});

module.exports = router;
