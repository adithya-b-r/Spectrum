import { ProfileHead } from "./Sections/ProfileHead";

export const Profile = () => {
  return (
    <main className="min-h-screen bg-[#f4f5f7] dark:bg-slate-950 py-6 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <ProfileHead />
      </div>
    </main>
  );
};