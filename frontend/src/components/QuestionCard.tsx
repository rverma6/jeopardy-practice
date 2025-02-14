import React from "react";

interface QuestionCardProps {
  category: string;
  value: number;
  question: string;
}

export const QuestionCard = ({
  category,
  value,
  question,
}: QuestionCardProps) => {
  return (
    <div className="w-full max-w-2xl bg-[#0928AB] rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-yellow-400 font-semibold">{category}</span>
        <span className="text-yellow-400 font-bold">${value}</span>
      </div>
      <div className="bg-[#0928AB] p-6 rounded">
        <p className="text-white text-xl text-center font-medium leading-relaxed">
          {question}
        </p>
      </div>
    </div>
  );
}; 