import { useRef, useState } from 'react';

export const Sidebar = () => {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const scroll = (direction: number) => {
    scrollRef.current?.scrollBy({ left: direction * 200, behavior: 'smooth' });
  };

  const items = ['For You', 'Following', 'Coding', 'Design', 'Animals', 'Travel', 'Music', 'Food', 'Art', 'History', 'Sports', 'Fitness', 'Gaming', 'Data Science', 'Technology'];

  return (
    <div className="overflow-hidden border-2 border-slate-200 rounded-full mb-8 flex items-center w-full">
      <i onClick={() => scroll(-1)} className="text-3xl text-gray-400 bx bxs-chevron-left cursor-pointer rounded-full w-[6%] h-[6%] ml-[10px]"></i>

      <ul ref={scrollRef} className="flex gap-4 md:gap-6 mx-2 my-2 whitespace-nowrap overflow-x-scroll items-center w-[95%]">
        {items.map((item, index) => (
          <li
            key={item}
            onClick={() => setActiveIndex(index)}
            className={`bg-slate-100 py-1 px-3 rounded-full cursor-pointer font-semibold ${activeIndex === index ? 'border-2 border-gray-400' : ''}`}
          >
            {item}
          </li>
        ))}
      </ul>

      <i onClick={() => scroll(1)} className="text-3xl text-gray-400 bx bxs-chevron-right cursor-pointer rounded-full w-[6%] h-[6%] mr-[10px]"></i>
    </div>
  );
};
