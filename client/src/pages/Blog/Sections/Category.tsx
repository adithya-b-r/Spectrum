export const Category = () => {
  const topics = ['Motivation', 'Communication', 'Productivity', 'Relationships', 'Fitness'];

  return (
    <div className="my-2 mx-5">
      <div className="flex gap-3 my-4 flex-wrap w-[100%]">
        {topics.map((topic, index) =>
          <button key={index} className="bg-gray-100 border-2 border-slate-300 hover:bg-gray-200 hover:border-slate-400 transition-all duration-200 text-sm font-semibold px-4 py-2 text-center rounded-full">{topic}</button>
        )}
      </div>
    </div>
  )
}