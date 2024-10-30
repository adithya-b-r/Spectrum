export const Recommends = () => {
  const topics = ["Machine Learning", "Electronics", "Investments", "Relationships", "Communications", "Productivity", "Money"]

  return (
    <div className="mb-3">
      <h1 className="text-2xl text-gray-800 font-bold tracking-wide inline-flex items-center gap-1">Recommended Topics <img src="recommended.png" className="size-8" alt="Recommended" /></h1>

      <div className="flex gap-3 my-4 flex-wrap">
        {topics.map((topic, index) =>
          <button key={index} className="bg-gray-200 text-sm px-4 py-2 text-center rounded-full">{topic}</button>
        )}
      </div>
    </div>
  )
}