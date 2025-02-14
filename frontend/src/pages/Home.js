import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../App.css';

const Home = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [score, setScore] = useState(0);
  const [insights, setInsights] = useState([]);

  const backendUrl = "http://localhost:3001/api";

  useEffect(() => {
    fetchQuestion();
    fetchInsights();
  }, []);

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/question`);
      setCurrentQuestion(response.data);
    } catch (error) {
      console.error("Error fetching question:", error);
      setFeedbackMessage("Error loading question. Please try again.");
    }
    setLoading(false);
  };

  const fetchInsights = async () => {
    try {
      const response = await axios.get(`${backendUrl}/insights`);
      setInsights(response.data.insights || []);
    } catch (error) {
      console.error("Error fetching insights:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentQuestion) return;

    setLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/check`, {
        questionId: currentQuestion.id,
        answer: userAnswer,
      });
      
      setFeedbackMessage(response.data.message);
      if (response.data.correct) {
        setScore(prevScore => prevScore + (currentQuestion.value || 0));
        setShowNext(true);
      }
      // Fetch updated insights after answering
      fetchInsights();
    } catch (error) {
      console.error("Error checking answer:", error);
      setFeedbackMessage("Error submitting answer. Please try again.");
    }
    setLoading(false);
  };

  const handleNextQuestion = () => {
    setUserAnswer('');
    setFeedbackMessage('');
    setShowNext(false);
    fetchQuestion();
  };

  const formatMoney = (amount) => {
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="game-container">
      <div className="question-card">
        <div className="category-title">{currentQuestion?.category || 'Loading...'}</div>
        <div className="value">{formatMoney(currentQuestion?.value || 0)}</div>
        <p className="question-text">{currentQuestion?.question || 'Loading question...'}</p>
        
        <form onSubmit={handleSubmit} className="answer-form">
          <input
            type="text"
            placeholder="What/Who is..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            disabled={loading || showNext}
          />
          <button 
            type="submit" 
            disabled={loading || userAnswer.trim() === '' || showNext}
          >
            Submit Answer
          </button>
        </form>
        
        {feedbackMessage && (
          <p className={`feedback ${showNext ? 'correct' : 'incorrect'}`}>
            {feedbackMessage}
          </p>
        )}
        
        {showNext && (
          <button onClick={handleNextQuestion} className="next-button">
            Next Question
          </button>
        )}
      </div>

      <div className="score-section">
        <h4>Your Score: <span id="currentScore">{formatMoney(score)}</span></h4>
      </div>

      <hr className="jeopardy-divider" />

      <h3>Study Insights & Performance</h3>
      <div id="insights">
        {insights.length > 0 ? (
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <h4>{insight.category}</h4>
                <p>Correct: {insight.correct}</p>
                <p>Incorrect: {insight.incorrect}</p>
                <p>Success Rate: {insight.percentage}%</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center">Answer some questions to see your performance insights!</p>
        )}
      </div>
    </div>
  );
};

export default Home;
