package in.adithyabr.spectrum_blog.service.blog;

import in.adithyabr.spectrum_blog.dto.blog.*;
import in.adithyabr.spectrum_blog.dto.comment.CommentResponse;
import in.adithyabr.spectrum_blog.entity.blog.Blog;

public interface BlogService {
  BlogResponse createBlog(Integer authorId, CreateBlogRequest request);
  BlogResponse toResponse(Blog blog);
  BlogResponse getSingleBlog(Integer id);
  BlogListResponse getUserBlogs(String userParam, int page, int limit);
  BlogResponse updateBlog(Integer authUserId, Integer blogId, UpdateBlogRequest request);
  void deleteBlog(Integer authUserId, Integer blogId);
  CommentResponse addComment(Integer currentUserId, Integer blogId, String content);
}
