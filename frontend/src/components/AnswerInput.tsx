import React, { useState } from "react";

interface AnswerInputProps {
  onSubmit: (answer: string) => void;
  disabled: boolean;
}

export const AnswerInput = ({ onSubmit, disabled }: AnswerInputProps) => {
  const [answer, setAnswer] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer);
      setAnswer("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="relative">
        <input
          type="text"
          placeholder="What/Who is..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 bg-white rounded border-2 border-[#0928AB] focus:outline-none focus:border-yellow-400 text-gray-800 disabled:bg-gray-100"
        />
        <button
          type="submit"
          disabled={disabled || !answer.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#0928AB] text-white px-6 py-1.5 rounded hover:bg-blue-800 transition-colors disabled:bg-gray-400"
        >
          Submit
        </button>
      </div>
    </form>
  );
}; 