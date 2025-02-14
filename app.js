const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());  // Enable CORS for frontend requests
app.use(express.json());  // Parse JSON request bodies

// Global variables to store questions and performance data
let questions = [];
let performanceData = {};

// Function to normalize individual question data from the JSON file
function normalizeQuestionData(item) {
  return {
    question: item.question || item.Question || '',
    answer: item.answer || item.Answer || '',
    category: item.category || item.Category || '',
    value: item.value ? parseInt(item.value) : 200
  };
}

// Load the questions dataset from the JSON file on startup
const datasetPath = path.join(__dirname, 'server', 'data', 'jeopardy_data.json');
try {
  const data = fs.readFileSync(datasetPath, 'utf8');
  // Normalize each question's data
  questions = JSON.parse(data).map(normalizeQuestionData);
  console.log(`Loaded ${questions.length} questions.`);
} catch (err) {
  console.error("Error loading dataset:", err);
  questions = []; // Initialize with empty array if file load fails
}

// Helper function to normalize and compare answers (case-insensitive, remove punctuation)
function normalizeAnswer(answer) {
  return answer.toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// API Endpoints
// Get a random question (excluding the answer)
app.get('/api/question', (req, res) => {
  if (questions.length === 0) {
    return res.status(500).json({ error: "No questions available" });
  }
  
  const randomIndex = Math.floor(Math.random() * questions.length);
  const question = questions[randomIndex];
  
  // Respond without exposing the answer
  res.json({
    _id: randomIndex,  // Use array index as ID
    category: question.category,
    question: question.question,
    value: question.value
  });
});

// Check an answer
app.post('/api/check', (req, res) => {
  const { questionId, answer } = req.body;
  
  if (questionId === undefined || !answer) {
    return res.status(400).json({ error: "Missing questionId or answer" });
  }
  
  if (!questions[questionId]) {
    return res.status(400).json({ error: "Invalid questionId" });
  }
  
  const correctAnswer = questions[questionId].answer;
  const isCorrect = normalizeAnswer(answer) === normalizeAnswer(correctAnswer);
  
  // Update performance data
  const category = questions[questionId].category;
  if (!performanceData[category]) {
    performanceData[category] = { correct: 0, incorrect: 0 };
  }
  if (isCorrect) {
    performanceData[category].correct++;
  } else {
    performanceData[category].incorrect++;
  }
  
  res.json({
    correct: isCorrect,
    message: isCorrect
      ? "Correct!"
      : `Incorrect. The correct answer was: ${correctAnswer}`,
    correctAnswer: correctAnswer
  });
});

// Get performance insights
app.get('/api/insights', (req, res) => {
  const insights = Object.entries(performanceData).map(([category, stats]) => ({
    category,
    correct: stats.correct,
    incorrect: stats.incorrect,
    percentage: Math.round((stats.correct / (stats.correct + stats.incorrect)) * 100) || 0
  }));
  
  res.json({ insights });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 