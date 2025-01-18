import { useState } from 'react';
import { PostCard } from '../../../components/PostCard';

export const Posts = () => {
  const [currentPost, setCurrentPost] = useState(3);

  return (
    <>
      {Array.from({ length: currentPost }).map((_, i) => (
        <PostCard
          key={i}
          name="Adithya"
          profileImg="nobita.jpg"
          isFollowing={false}
          isSaved={false}
          isLiked={false}
          postImg='blogImage.jpg'
          title="Title of the post"
          description="Lorem ipsum dolor, sit amet consectetur adipisicing elit. Maiores repudiandae voluptates accusamus eos dolorum velit..."
          url='https://spectrum-blog.vercel.app/'
        />
      ))}

      <div className="flex w-full align-center justify-center">
        <button onClick={() => setCurrentPost(currentPost+3)} className={`bg-blue-500 py-2 px-4 text-white font-semibold rounded-lg ${currentPost > 30 ? 'opacity-85' : ''}`} disabled={currentPost>30}>Load More</button>
      </div>
    </>
  );
};
