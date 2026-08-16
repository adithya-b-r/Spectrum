package in.adithyabr.spectrum_blog.service.blog;

import in.adithyabr.spectrum_blog.dto.blog.*;
import in.adithyabr.spectrum_blog.dto.comment.CommentListResponse;
import in.adithyabr.spectrum_blog.dto.comment.CommentResponse;
import in.adithyabr.spectrum_blog.dto.like.BlogLikesResponse;
import in.adithyabr.spectrum_blog.dto.like.ToggleLikeResponse;
import in.adithyabr.spectrum_blog.dto.save.ToggleSaveResponse;
import in.adithyabr.spectrum_blog.entity.blog.Blog;

public interface BlogService {
  BlogResponse createBlog(Integer authorId, CreateBlogRequest request);
  BlogResponse toResponse(Blog blog);
  BlogResponse getSingleBlog(Integer id);
  BlogListResponse getUserBlogs(String userParam, int page, int limit);
  BlogResponse updateBlog(Integer authUserId, Integer blogId, UpdateBlogRequest request);
  void deleteBlog(Integer authUserId, Integer blogId);
  ToggleLikeResponse toggleLike(Integer currentUserId, Integer blogId);
  BlogLikesResponse getLikes(Integer blogId);
  CommentResponse addComment(Integer currentUserId, Integer blogId, String content);
  CommentListResponse getBlogComments(Integer blogId, int page, int limit);
  void deleteComment(Integer currentUserId, Integer commentId);
  ToggleSaveResponse toggleSave(Integer currentUserId, Integer blogId);
  BlogListResponse getSavedBlogs(Integer authUserId, String userParam, int page, int limit);
  BlogListResponse getAllBlogs(int page, int limit);
  BlogListResponse getLikedBlogs(Integer authUserId, String userParam, int page, int limit);
}
