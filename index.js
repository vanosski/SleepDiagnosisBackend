const express = require('express');
const cors = require('cors');
const trainRoute = require('./routes/trainRoute'); // Import train route
const predictRoute = require('./routes/predictRoute'); // Import predict route

const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON requests

// Use the routes
app.use('/api', trainRoute); 
app.use('/api', predictRoute);

// Server listening on port 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
