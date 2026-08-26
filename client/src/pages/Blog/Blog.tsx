import { useState, useEffect } from "react";
import { BlogPost } from "./Sections/BlogPost";

export const Blog = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-transparent z-50">
        <div
          className="h-full bg-indigo-600 transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 py-6 sm:py-10 px-4 sm:px-6">
        <article className="max-w-[720px] mx-auto">
          <BlogPost />
        </article>
      </main>
    </>
  );
};