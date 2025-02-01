import { AuthorCard } from "./Sections/AuthorCard"
import { BlogPost } from "./Sections/BlogPost"
import { Category } from "./Sections/Category"
import { PostFeedbackBar } from "./Sections/PostFeedbackBar"

export const Blog = () => {
  return (
    <div className="mx-[15%] w-[70%] h-fit overflow-y-scroll flex flex-col border-x-[1px]">
      <BlogPost />
      <Category />
      <PostFeedbackBar />
      <AuthorCard />
    </div >
  )
}