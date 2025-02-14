const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

let questions = [];

// Load questions from JSON file
async function loadQuestions() {
  try {
    const data = await fs.readFile(path.join(__dirname, '../data/jeopardy_data.json'), 'utf8');
    questions = JSON.parse(data);
    // Add ID to each question
    questions = questions.map((q, index) => ({ ...q, id: index }));
  } catch (error) {
    console.error('Error loading questions:', error);
  }
}

loadQuestions();

// Global performance data (for demo purposes; not persistent)
let performanceData = {}; // structure: { category: { correct: number, incorrect: number } }

// Utility: Normalize answers for comparison
function normalizeAnswer(answer) {
  // First capture the question word if it exists
  const cleanAnswer = answer.trim().replace(/\?$/, ''); // Remove question mark from the end
  const questionWordMatch = cleanAnswer.toLowerCase().match(/^(what|who|where|when|why|how)(\s+is|\s+are|\s+was|\s+were)?\s+/i);
  
  // Get the core answer part (everything after the question phrase if it exists)
  let coreAnswer = cleanAnswer.toLowerCase();
  if (questionWordMatch) {
    coreAnswer = coreAnswer.slice(questionWordMatch[0].length);
  }

  // Remove articles from the beginning
  coreAnswer = coreAnswer
    .replace(/^(the|a|an)\s+/i, '')
    // Remove punctuation and extra spaces
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()'"?]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return coreAnswer;
}

// Utility: Compute Levenshtein Distance for fuzzy matching
function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = [];
  
  for (let i = 0; i <= m; i++) {
    dp[i] = Array(n + 1).fill(0);
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i-1] === b[j-1]) {
        dp[i][j] = dp[i-1][j-1];
      } else {
        dp[i][j] = Math.min(
          dp[i-1][j] + 1,    // deletion
          dp[i][j-1] + 1,    // insertion
          dp[i-1][j-1] + 1   // substitution
        );
      }
    }
  }
  return dp[m][n];
}

// Utility: Compare user's answer with the correct answer using normalization and fuzzy matching.
function isAnswerCorrect(userAnswer, correctAnswer) {
  const normalizedUser = normalizeAnswer(userAnswer);
  const normalizedCorrect = normalizeAnswer(correctAnswer);

  if (normalizedUser === normalizedCorrect) {
    return true;
  }
  
  // Allow a small edit distance for typos/variations.
  const threshold = 2;
  const distance = levenshteinDistance(normalizedUser, normalizedCorrect);
  return distance <= threshold;
}

// Utility: Check if answer is in question format
function isQuestionFormat(answer) {
  // Remove question mark from the end before checking format
  const cleanAnswer = answer.trim().replace(/\?$/, '');
  return /^(what|who|where|when|why|how)(\s+is|\s+are|\s+was|\s+were)\s+/i.test(cleanAnswer);
}

// Utility: Extract and validate image URL from question text
function extractImageUrl(question) {
  const imgRegex = /<a href="([^"]+)"[^>]*>/;
  const match = question.match(imgRegex);
  return match ? match[1] : null;
}

// Utility: Clean question text by removing HTML tags
function cleanQuestionText(question) {
  return question.replace(/<[^>]*>/g, '');
}

// Get random question
router.get('/question', (req, res) => {
  if (questions.length === 0) {
    return res.status(500).json({ error: 'No questions available' });
  }
  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
  // Don't send the answer to the client
  const { answer, ...questionWithoutAnswer } = randomQuestion;
  const imageUrl = extractImageUrl(randomQuestion.question);
  res.json({
    ...questionWithoutAnswer,
    imageUrl: imageUrl,
    hasImage: !!imageUrl
  });
});

// Check answer
router.post('/check', (req, res) => {
  const { questionId, answer } = req.body;
  const question = questions.find(q => q.id === questionId);
  
  if (!question) {
    return res.status(404).json({ message: 'Question not found' });
  }

  // First check if the answer is in question format
  const hasQuestionFormat = isQuestionFormat(answer);

  // Normalize both answers for comparison
  const userAnswer = normalizeAnswer(answer);
  const correctAnswer = normalizeAnswer(question.answer);
  
  // Check if core answers match
  const isContentCorrect = userAnswer === correctAnswer || isCloseEnough(userAnswer, correctAnswer);
  
  // Update performance data only if both format and content are correct
  if (!performanceData[question.category]) {
    performanceData[question.category] = { correct: 0, incorrect: 0 };
  }
  
  if (isContentCorrect && hasQuestionFormat) {
    performanceData[question.category].correct++;
  } else {
    performanceData[question.category].incorrect++;
  }

  // Format the correct answer to show
  let displayAnswer = question.answer;
  if (!question.answer.toLowerCase().match(/^(what|who|where|when|why|how)(\s+is|\s+are|\s+was|\s+were)\s+/i)) {
    displayAnswer = `What is ${question.answer}`;
  }
  
  // Determine response message
  let message;
  if (isContentCorrect && !hasQuestionFormat) {
    message = `Your answer was correct, but don't forget to phrase it as a question! The correct format would be: ${displayAnswer}`;
  } else if (!isContentCorrect) {
    message = `Sorry, the correct answer was: ${displayAnswer}`;
  } else {
    message = 'Correct!';
  }
  
  res.json({
    correct: isContentCorrect && hasQuestionFormat,
    message: message,
    debug: {
      normalizedUser: userAnswer,
      normalizedCorrect: correctAnswer,
      hasQuestionFormat: hasQuestionFormat
    }
  });
});

// Endpoint: Get performance insights
router.get('/insights', (req, res) => {
  res.json({ performance: performanceData });
});

// NEW ENDPOINT: Generate board data based on round query parameter.
// Valid values for regular and double rounds:
router.get('/board', (req, res) => {
  const round = req.query.round || "Jeopardy!";
  const valuesRegular = [200, 400, 600, 800, 1000];
  const valuesDouble = [400, 800, 1200, 1600, 2000];
  const validValues = (round === "Double Jeopardy!") ? valuesDouble : valuesRegular;

  // Filter questions by round and valid monetary value.
  const boardQuestions = questions.filter(q => {
    if (q.round !== round) return false;
    // Remove the '$' and convert to a number.
    const numericValue = parseInt(q.value.replace('$', ''));
    return validValues.includes(numericValue);
  });

  // Extract unique categories from the filtered questions.
  const categories = [...new Set(boardQuestions.map(q => q.category))];
  // (Optional) Sort categories alphabetically.
  categories.sort();

  // Build a board data structure: each category maps its valid monetary values to a question.
  const boardData = { categories: categories, clues: {} };
  categories.forEach(category => {
    boardData.clues[category] = {};
    validValues.forEach(val => {
      const clue = boardQuestions.find(q => q.category === category && parseInt(q.value.replace('$', '')) === val);
      if (clue) {
        const imageUrl = extractImageUrl(clue.question);
        boardData.clues[category][val] = {
          id: clue.id,
          question: cleanQuestionText(clue.question),
          imageUrl: imageUrl,
          answer: clue.answer,
          value: val,
          hasImage: !!imageUrl
        };
      }
    });
  });

  res.json(boardData);
});

// Utility: Extract last name from full name
function extractLastName(name) {
  return name.split(' ').pop().toLowerCase();
}

// Utility: Normalize names for comparison
function normalizeNameAnswer(answer, correctAnswer) {
  // Remove common titles and prefixes
  const titles = ['dr', 'mr', 'mrs', 'ms', 'prof', 'sir', 'dame'];
  let normalizedAnswer = answer.toLowerCase();
  let normalizedCorrect = correctAnswer.toLowerCase();
  
  titles.forEach(title => {
    normalizedAnswer = normalizedAnswer.replace(new RegExp(`^${title}\\.?\\s+`), '');
    normalizedCorrect = normalizedCorrect.replace(new RegExp(`^${title}\\.?\\s+`), '');
  });

  // If correct answer has multiple parts (full name) and user provided last name only
  if (normalizedCorrect.includes(' ') && !normalizedAnswer.includes(' ')) {
    return extractLastName(normalizedAnswer) === extractLastName(normalizedCorrect);
  }

  return normalizedAnswer === normalizedCorrect;
}

// Update the isCloseEnough function
function isCloseEnough(str1, str2) {
  // Direct match
  if (str1 === str2) return true;
  
  // Name comparison for "who is" answers
  if (str1.startsWith('who') || str2.startsWith('who')) {
    return normalizeNameAnswer(str1, str2);
  }
  
  // Check for plural/singular variations
  if (str1 + 's' === str2 || str1 === str2 + 's') return true;
  
  // For longer answers, allow for minor typos
  if (str1.length > 5 && str2.length > 5) {
    const maxDistance = Math.floor(Math.min(str1.length, str2.length) * 0.2); // Allow 20% difference
    const distance = levenshteinDistance(str1, str2);
    return distance <= maxDistance;
  }
  
  return false;
}

module.exports = router; 