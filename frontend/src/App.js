import React, { useState, useEffect } from "react";
import { QuestionCard } from "./components/QuestionCard.tsx";
import { AnswerInput } from "./components/AnswerInput.tsx";

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    fetchNewQuestion();
  }, []);

  const fetchNewQuestion = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/question');
      const data = await response.json();
      setCurrentQuestion(data);
      setIsAnswered(false);
      setFeedback("");
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const handleAnswerSubmit = async (answer) => {
    if (!currentQuestion || isAnswered) return;

    try {
      const response = await fetch('http://localhost:3001/api/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          answer: answer
        }),
      });

      const data = await response.json();
      setFeedback(data.message);
      setIsAnswered(true);

      if (data.correct) {
        setScore(prevScore => prevScore + parseInt(currentQuestion.value.replace('$', '')));
      }
    } catch (error) {
      console.error('Error checking answer:', error);
      setFeedback("Error checking answer. Please try again.");
    }
  };

  const handleNextQuestion = () => {
    fetchNewQuestion();
  };

  return (
    <main className="min-h-screen w-full bg-[#000B5D] flex flex-col items-center px-4 py-8">
      <header className="mb-12 text-center">
        <h1
          className="text-6xl md:text-7xl font-bold mb-6 tracking-tighter uppercase scale-y-125"
          style={{
            fontFamily: "Arial Narrow, Arial, sans-serif",
            background:
              "linear-gradient(to bottom, #fff 40%, #c7af62 55%, #fff 75%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "2px 2px 4px rgba(0,0,0,0.4)",
            letterSpacing: "-0.05em",
          }}
        >
          Jeopardy!
        </h1>
        <p className="text-white opacity-90 text-lg">
          Test your knowledge with real Jeopardy questions!
        </p>
        <p className="text-yellow-400 text-2xl mt-4">Score: ${score}</p>
      </header>
      
      {currentQuestion && (
        <QuestionCard
          category={currentQuestion.category}
          value={parseInt(currentQuestion.value.replace('$', ''))}
          question={currentQuestion.question}
        />
      )}
      
      <AnswerInput 
        onSubmit={handleAnswerSubmit}
        disabled={isAnswered}
      />
      
      {feedback && (
        <div className={`mt-4 p-3 rounded ${isAnswered ? 'bg-green-600' : 'bg-red-600'} text-white`}>
          {feedback}
        </div>
      )}
      
      {isAnswered && (
        <button
          onClick={handleNextQuestion}
          className="mt-4 bg-yellow-400 text-blue-900 px-6 py-2 rounded font-bold hover:bg-yellow-300 transition-colors"
        >
          Next Question
        </button>
      )}
    </main>
  );
}

export default App;