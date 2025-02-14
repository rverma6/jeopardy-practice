import React, { useState } from "react";

interface QuestionCardProps {
  category: string;
  value: number;
  question: string;
  imageUrl?: string;
  hasImage?: boolean;
}

export const QuestionCard = ({
  category,
  value,
  question,
  imageUrl,
  hasImage,
}: QuestionCardProps) => {
  const [imageError, setImageError] = useState(false);

  // Function to get proxied image URL
  const getProxiedImageUrl = (url: string) => {
    if (!url) return '';
    const baseUrl = process.env.REACT_APP_API_URL;
    if (!baseUrl) throw new Error('API URL not configured');
    return `${baseUrl}/api/proxy-image?url=${encodeURIComponent(url)}`;
  };

  // Format text with line breaks
  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  // Skip rendering if it's an image-only question and image failed to load
  if (hasImage && imageError) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl bg-[#0928AB] rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-yellow-400 font-semibold">{category}</span>
        <span className="text-yellow-400 font-bold">${value}</span>
      </div>
      <div className="bg-[#0928AB] p-6 rounded">
        <p className="text-white text-xl text-center font-medium leading-relaxed">
          {formatText(question)}
        </p>
        {imageUrl && (
          <div className="mt-4 flex justify-center">
            <img
              src={getProxiedImageUrl(imageUrl)}
              alt="Clue visual"
              className="max-w-full h-auto rounded"
              onError={() => setImageError(true)}
              style={{ maxHeight: '300px' }}
              crossOrigin="anonymous"
            />
          </div>
        )}
      </div>
    </div>
  );
}; 