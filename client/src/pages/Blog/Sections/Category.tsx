import React from 'react';
import { useNavigate } from 'react-router-dom';

interface CategoryProps {
  tags?: string[];
}

export const Category: React.FC<CategoryProps> = ({ tags = [] }) => {
  const navigate = useNavigate();
  if (!tags || tags.length === 0) return null;

  return (
    <div className="pt-8 pb-2">
      <div className="flex items-center gap-2 flex-wrap">
        {tags.map((topic, index) => (
          <span
            key={index}
            onClick={() => navigate(`/search?tag=${encodeURIComponent(topic)}`)}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 px-3.5 py-1.5 rounded-full border border-gray-600 transition-all duration-150 cursor-pointer"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
};