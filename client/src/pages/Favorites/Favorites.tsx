import { FavoritesHead } from "./Sections/FavoritesHead";

export const Favorites = () => {
  return (
    <main className="min-h-screen bg-[#f4f5f7] dark:bg-slate-950 py-6 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <FavoritesHead />
      </div>
    </main>
  );
};

