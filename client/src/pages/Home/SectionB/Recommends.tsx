import { useNavigate } from "react-router-dom";

export const Recommends = () => {
  const navigate = useNavigate();

  const topics = [
    { name: "Machine Learning", icon: "bx bx-globe" },
    { name: "Electronics", icon: "bx bx-chip" },
    { name: "Investments", icon: "bx bx-trending-up" },
    { name: "Relationships", icon: "bx bx-heart" },
    { name: "Communications", icon: "bx bx-message-rounded" },
    { name: "Productivity", icon: "bx bx-pencil" },
    { name: "Money", icon: "bx bx-dollar-circle" },
    { name: "More+", icon: "" },
  ];

  const handleTopicClick = (topicName: string) => {
    if (topicName === "More+") {
      navigate("/search");
    } else {
      navigate(`/search?tag=${encodeURIComponent(topicName)}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_2px_12px_rgba(0,0,0,0.05)] select-none">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
          Recommended Topics
        </h2>
        <span
          onClick={() => navigate("/search")}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          Explore all
        </span>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {topics.map((topic, index) => (
          <button
            key={index}
            onClick={() => handleTopicClick(topic.name)}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 px-3.5 py-1.5 rounded-full border border-gray-600 transition-all duration-150 cursor-pointer"
          >
            {topic.icon && <i className={`${topic.icon} text-sm text-gray-500`}></i>}
            <span>{topic.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};