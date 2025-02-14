import React, { useEffect, useState } from 'react';
import '../App.css';

function Dashboard() {
  const [performance, setPerformance] = useState({});
  const [loading, setLoading] = useState(true);

  const backendUrl = "http://localhost:3001/api";

  useEffect(() => {
    async function fetchPerformance() {
      try {
        const res = await fetch(`${backendUrl}/insights`);
        const data = await res.json();
        setPerformance(data.performance);
      } catch (error) {
        console.error("Error fetching performance:", error);
      }
      setLoading(false);
    }
    fetchPerformance();
  }, []);

  // Calculate total questions answered.
  const totalAnswered = Object.values(performance).reduce(
    (total, stats) => total + (stats.correct + stats.incorrect),
    0
  );

  // Define a mapping from raw category names to friendlier names.
  const categoryMapping = {
    "HISTORY": "History & Culture",
    "ESPN's TOP 10 ALL-TIME ATHLETES": "Sports & Athletics",
    "EVERYBODY TALKS ABOUT IT...": "Pop Culture",
    "THE COMPANY LINE": "Business & Economics",
    "EPITAPHS & TRIBUTES": "Famous Figures"
    // Add more mappings as needed.
  };

  // Generate study suggestions once the user has answered at least 100 questions.
  const insights = [];
  if (totalAnswered >= 100) {
    for (const [category, stats] of Object.entries(performance)) {
      const attempts = stats.correct + stats.incorrect;
      if (attempts < 5) continue; // Skip categories with too few attempts.
      const accuracy = (stats.correct / attempts) * 100;
      const friendlyCategory = categoryMapping[category] || category;
      // Example: if accuracy is less than 50%, suggest reviewing material.
      if (accuracy < 50) {
        insights.push({
          category: friendlyCategory,
          accuracy: Math.round(accuracy),
          suggestion: `Review fundamental topics related to ${friendlyCategory}. Consider studying key concepts and related terminology.`
        });
      }
    }
  }

  return (
    <div className="dashboard-page">
      <h1>Performance Dashboard</h1>
      {loading ? (
        <p>Loading insights...</p>
      ) : (
        <>
          {totalAnswered < 100 ? (
            <p>
              You have answered {totalAnswered} questions. Answer at least 100 questions to view performance insights.
            </p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Correct</th>
                    <th>Incorrect</th>
                    <th>Accuracy (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(performance).map(([category, stats]) => {
                    const attempts = stats.correct + stats.incorrect;
                    return (
                      <tr key={category}>
                        <td>{categoryMapping[category] || category}</td>
                        <td>{stats.correct}</td>
                        <td>{stats.incorrect}</td>
                        <td>{attempts > 0 ? Math.round((stats.correct / attempts) * 100) : 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="insights">
                <h2>Study Suggestions</h2>
                {insights.length > 0 ? (
                  <ul>
                    {insights.map((insight, index) => (
                      <li key={index}>
                        <strong>{insight.category}:</strong> {insight.suggestion} (Accuracy: {insight.accuracy}%)
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Great job! Your performance is strong across all categories.</p>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard; 