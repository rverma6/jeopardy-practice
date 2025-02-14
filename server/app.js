const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Routes for trivia endpoints
const triviaRoutes = require('./routes/trivia');
app.use('/api', triviaRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
}); 