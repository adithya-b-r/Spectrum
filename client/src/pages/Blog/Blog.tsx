import { AuthorCard } from "./Sections/AuthorCard"
import { BlogPost } from "./Sections/BlogPost"
import { Category } from "./Sections/Category"
import { PostFeedbackBar } from "./Sections/PostFeedbackBar"

export const Blog = () => {
  return (
    <div className="md:mx-[15%] md:w-[70%] m-full h-fit overflow-y-scroll flex flex-col border-x-[1px]">
      <BlogPost />
      <Category />
      <PostFeedbackBar />
      <AuthorCard />
    </div >
  )
}