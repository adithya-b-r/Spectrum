import { useRef, useState } from 'react';

export const Sidebar = () => {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const scroll = (direction: number) => {
    scrollRef.current?.scrollBy({ left: direction * 200, behavior: 'smooth' });
  };

  const items = ['For You', 'Following', 'Coding', 'Design', 'Animals', 'Travel', 'Music', 'Food', 'Art', 'History', 'Sports', 'Fitness', 'Gaming', 'Data Science', 'Technology'];

  return (
    <div className="relative overflow-hidden border-b-2 border-b-gray-200 rounded-sm mb-8">
      <i onClick={() => scroll(-1)} className="text-3xl text-gray-400 bx bxs-chevron-left absolute left-0 top-4 -translate-y-1/2 cursor-pointer z-10 p-1 "></i>

      <ul ref={scrollRef} className="flex gap-10  mx-10 whitespace-nowrap overflow-x-scroll items-center">
        {items.map((item, index) => (
          <li
            key={item}
            onClick={() => setActiveIndex(index)}
            className={`cursor-pointer h-10 font-semibold transition-all duration-100  ${activeIndex === index ? 'border-b-2 border-b-gray-400' : ''}`}
          >
            {item}
          </li>
        ))}
      </ul>

      <i onClick={() => scroll(1)} className="text-3xl text-gray-400 bx bxs-chevron-right absolute right-0 top-4 -translate-y-1/2 cursor-pointer z-10 bg-transparent p-1 rounded-full "></i>
    </div>
  );
};
