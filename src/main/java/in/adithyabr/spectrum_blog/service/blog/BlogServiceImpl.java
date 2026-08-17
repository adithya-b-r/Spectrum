package in.adithyabr.spectrum_blog.service.blog;

import in.adithyabr.spectrum_blog.dto.blog.*;
import in.adithyabr.spectrum_blog.dto.pagination.PaginationResponse;
import in.adithyabr.spectrum_blog.dto.user.UserResponse;
import in.adithyabr.spectrum_blog.entity.blog.Blog;
import in.adithyabr.spectrum_blog.entity.blog.BlogContent;
import in.adithyabr.spectrum_blog.entity.blogcomment.Comment;
import in.adithyabr.spectrum_blog.entity.bloglike.BlogLike;
import in.adithyabr.spectrum_blog.entity.bloglike.BlogLikeId;
import in.adithyabr.spectrum_blog.entity.blogsave.BlogSave;
import in.adithyabr.spectrum_blog.entity.blogsave.BlogSaveId;
import in.adithyabr.spectrum_blog.entity.notification.Notification;
import in.adithyabr.spectrum_blog.entity.user.User;
import in.adithyabr.spectrum_blog.entity.user.UserFollower;
import in.adithyabr.spectrum_blog.exception.BadRequestException;
import in.adithyabr.spectrum_blog.exception.ForbiddenException;
import in.adithyabr.spectrum_blog.exception.ResourceNotFoundException;
import in.adithyabr.spectrum_blog.mapper.UserMapper;
import in.adithyabr.spectrum_blog.repository.blog.BlogContentRepository;
import in.adithyabr.spectrum_blog.repository.blog.BlogRepository;
import in.adithyabr.spectrum_blog.repository.blogcomment.CommentRepository;
import in.adithyabr.spectrum_blog.repository.bloglike.BlogLikeRepository;
import in.adithyabr.spectrum_blog.repository.blogsave.BlogSaveRepository;
import in.adithyabr.spectrum_blog.repository.notification.NotificationRepository;
import in.adithyabr.spectrum_blog.repository.user.UserFollowerRepository;
import in.adithyabr.spectrum_blog.repository.user.UserRepository;
import in.adithyabr.spectrum_blog.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {
  private final BlogRepository blogRepository;
  private final BlogContentRepository blogContentRepository;
  private final UserRepository userRepository;
  private final UserFollowerRepository userFollowerRepository;
  private final NotificationRepository notificationRepository;
  private final BlogLikeRepository blogLikeRepository;
  private final CommentRepository commentRepository;
  private final BlogSaveRepository blogSaveRepository;
  private final ModelMapper modelMapper;
  private final UserMapper userMapper;
  private final S3Service s3Service;

  private Blog findBlogById(Integer id) {
    return blogRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
  }

  private User resolveUser(String userParam) {
    if (userParam == null || userParam.trim().isEmpty()) {
      return null;
    }
    try {
      Integer userId = Integer.parseInt(userParam.trim());
      Optional<User> userOptional = userRepository.findById(userId);
      if (userOptional.isPresent()) return userOptional.get();
    } catch (NumberFormatException ignored) {}

    String cleanUsername = userParam.replaceFirst("^@", "").trim();
    return userRepository.findByUsername(cleanUsername).orElse(null);
  }

  private Integer resolveUserId(String userParam) {
    User user = resolveUser(userParam);
    return user != null ? user.getId() : null;
  }

  @Override
  @Transactional
  public BlogResponse createBlog(Integer authorId, CreateBlogRequest request) {
    if (request.getTitle() == null || request.getTitle().trim().isEmpty() ||
        request.getContent() == null || request.getContent().isEmpty()) {
      throw new BadRequestException("Title and content are required");
    }

    User author = userRepository.findById(authorId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    Blog blog = Blog.builder()
        .title(request.getTitle().trim())
        .subtitle(request.getSubtitle() != null ? request.getSubtitle().trim() : "")
        .author(author)
        .views(0)
        .build();

    Blog savedBlog = blogRepository.save(blog);

    saveContentBlocks(savedBlog, request.getContent());

    // Notify author's followers
    List<UserFollower> followers = userFollowerRepository.findByFollowingId(authorId);
    for (UserFollower follower : followers) {
      if (!follower.getFollowerId().equals(authorId)) {
        User recipient = userRepository.findById(follower.getFollowerId()).orElse(null);
        if (recipient != null) {
          notificationRepository.save(
              Notification.builder()
                  .recipient(recipient)
                  .sender(author)
                  .type(Notification.NotificationType.STORY)
                  .blog(savedBlog)
                  .message("published a new story: \"" + savedBlog.getTitle() + "\"")
                  .build()
          );
        }
      }
    }

    return toResponse(savedBlog);
  }

  @Override
  @Transactional
  public BlogResponse getSingleBlog(Integer id) {
    Blog blog = findBlogById(id);

    blog.setViews((blog.getViews() != null ? blog.getViews() : 0) + 1);
    Blog updatedBlog = blogRepository.save(blog);

    return toResponse(updatedBlog);
  }

  @Override
  public BlogListResponse getUserBlogs(String userParam, int page, int limit) {
    User user = resolveUser(userParam);
    if (user == null) {
      return new BlogListResponse(
          Collections.emptyList(),
          PaginationResponse.empty(limit)
      );
    }

    Pageable pageable = PageRequest.of(page - 1, limit);
    Page<Blog> blogPage = blogRepository.findByAuthorIdOrderByCreatedAtDesc(user.getId(), pageable);

    List<Blog> blogs = blogPage.getContent();
    List<BlogResponse> blogResponses = new ArrayList<>();
    for (Blog blog : blogs) {
      blogResponses.add(toFeedResponse(blog));
    }

    return new BlogListResponse(blogResponses, PaginationResponse.of(blogPage, page, limit));
  }

  @Override
  @Transactional
  public BlogResponse updateBlog(Integer authUserId, Integer blogId, UpdateBlogRequest request) {
    Blog blog = findBlogById(blogId);

    if (!blog.getAuthor().getId().equals(authUserId)) {
      throw new ForbiddenException("Forbidden: You are not authorized to update this blog");
    }

    if (request.getTitle() != null) {
      if (request.getTitle().trim().isEmpty()) {
        throw new BadRequestException("Title cannot be empty");
      }
      blog.setTitle(request.getTitle().trim());
    }

    if (request.getSubtitle() != null) {
      blog.setSubtitle(request.getSubtitle().trim());
    }

    if (request.getContent() != null) {
      if (request.getContent().isEmpty()) {
        throw new BadRequestException("Content cannot be empty");
      }
      List<BlogContent> oldContents = blogContentRepository.findByBlogIdOrderByBlockOrderAsc(blogId);
      List<String> newImageUrls = new ArrayList<>();
      for (BlogContentDto dto : request.getContent()) {
        if ("image".equalsIgnoreCase(dto.getType()) && dto.getContent() != null) {
          newImageUrls.add(dto.getContent().trim());
        }
      }
      for (BlogContent oldContent : oldContents) {
        if ("image".equalsIgnoreCase(oldContent.getType()) && oldContent.getContent() != null) {
          String oldUrl = oldContent.getContent().trim();
          if (!newImageUrls.contains(oldUrl)) {
            try {
              s3Service.deleteFile(oldUrl);
            } catch (Exception ignored) {}
          }
        }
      }
      blogContentRepository.deleteAll(oldContents);
      saveContentBlocks(blog, request.getContent());
    }

    Blog updatedBlog = blogRepository.save(blog);
    return toResponse(updatedBlog);
  }

  @Override
  @Transactional
  public void deleteBlog(Integer authUserId, Integer blogId) {
    Blog blog = findBlogById(blogId);

    if (!blog.getAuthor().getId().equals(authUserId)) {
      throw new ForbiddenException("Forbidden: You are not authorized to delete this blog");
    }

    List<BlogContent> contents = blogContentRepository.findByBlogIdOrderByBlockOrderAsc(blogId);
    for (BlogContent content : contents) {
      if ("image".equalsIgnoreCase(content.getType()) && content.getContent() != null) {
        s3Service.deleteFile(content.getContent());
      }
    }

    blogRepository.delete(blog);
  }

  @Override
  @Transactional
  public ToggleLikeResponse toggleLike(Integer currentUserId, Integer blogId) {
    Blog blog = findBlogById(blogId);

    User currentUser = userRepository.findById(currentUserId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    boolean isLiked = blogLikeRepository.existsByBlogIdAndUserId(blogId, currentUserId);
    if (isLiked) {
      blogLikeRepository.deleteById(new BlogLikeId(blogId, currentUserId));
    } else {
      blogLikeRepository.save(
          BlogLike.builder()
              .blogId(blogId)
              .userId(currentUserId)
              .build()
      );

      if (blog.getAuthor() != null && !blog.getAuthor().getId().equals(currentUserId)) {
        notificationRepository.save(
            Notification.builder()
                .recipient(blog.getAuthor())
                .sender(currentUser)
                .type(Notification.NotificationType.LIKE)
                .blog(blog)
                .message("liked your story")
                .build()
        );
      }
    }

    long likesCount = blogLikeRepository.countByBlogId(blogId);
    List<BlogLike> blogLikes = blogLikeRepository.findByBlogId(blogId);
    List<Integer> likes = new ArrayList<>();
    for (BlogLike blogLike : blogLikes) {
      likes.add(blogLike.getUserId());
    }

    return ToggleLikeResponse.builder()
        .liked(!isLiked)
        .likesCount(likesCount)
        .likes(likes)
        .build();
  }

  @Override
  public BlogLikesResponse getLikes(Integer blogId) {
    if (!blogRepository.existsById(blogId)) {
      throw new ResourceNotFoundException("Blog not found");
    }

    long likesCount = blogLikeRepository.countByBlogId(blogId);
    List<BlogLike> blogLikes = blogLikeRepository.findByBlogId(blogId);
    List<Integer> likes = new ArrayList<>();
    for (BlogLike blogLike : blogLikes) {
      likes.add(blogLike.getUserId());
    }

    return BlogLikesResponse.builder()
        .likesCount(likesCount)
        .likes(likes)
        .build();
  }

  @Override
  @Transactional
  public CommentResponse addComment(Integer currentUserId, Integer blogId, String content) {
    if (content == null || content.trim().isEmpty()) {
      throw new BadRequestException("Comment content is required");
    }

    Blog blog = findBlogById(blogId);

    User currentUser = userRepository.findById(currentUserId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    Comment comment = Comment.builder()
        .blog(blog)
        .user(currentUser)
        .content(content.trim())
        .build();

    Comment savedComment = commentRepository.save(comment);

    if (blog.getAuthor() != null && !blog.getAuthor().getId().equals(currentUserId)) {
      String trimmed = content.trim();
      String message = trimmed.length() > 60 ? trimmed.substring(0, 60) + "..." : trimmed;
      notificationRepository.save(
          Notification.builder()
              .recipient(blog.getAuthor())
              .sender(currentUser)
              .type(Notification.NotificationType.COMMENT)
              .blog(blog)
              .comment(savedComment)
              .message(message)
              .build()
      );
    }

    return toCommentResponse(savedComment);
  }

  @Override
  public CommentListResponse getBlogComments(Integer blogId, int page, int limit) {
    if (!blogRepository.existsById(blogId)) {
      throw new ResourceNotFoundException("Blog not found");
    }

    Pageable pageable = PageRequest.of(page - 1, limit);
    Page<Comment> commentPage = commentRepository.findByBlogIdOrderByCreatedAtDesc(blogId, pageable);

    List<Comment> comments = commentPage.getContent();
    List<CommentResponse> commentResponses = new ArrayList<>();
    for (Comment comment : comments) {
      commentResponses.add(toCommentResponse(comment));
    }

    return CommentListResponse.builder()
        .comments(commentResponses)
        .pagination(PaginationResponse.of(commentPage, page, limit))
        .build();
  }

  @Override
  @Transactional
  public void deleteComment(Integer currentUserId, Integer commentId) {
    Comment comment = commentRepository.findById(commentId)
        .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

    boolean isCommentAuthor = comment.getUser() != null && currentUserId.equals(comment.getUser().getId());
    boolean isBlogAuthor = comment.getBlog() != null && comment.getBlog().getAuthor() != null && currentUserId.equals(comment.getBlog().getAuthor().getId());

    if (!isCommentAuthor && !isBlogAuthor) {
      throw new ForbiddenException("Forbidden: You are not authorized to delete this comment");
    }

    commentRepository.delete(comment);
  }

  @Override
  @Transactional
  public ToggleSaveResponse toggleSave(Integer currentUserId, Integer blogId) {
    if (!blogRepository.existsById(blogId)) {
      throw new ResourceNotFoundException("Blog not found");
    }

    boolean isSaved = blogSaveRepository.existsByUserIdAndBlogId(currentUserId, blogId);
    if (isSaved) {
      blogSaveRepository.deleteById(new BlogSaveId(currentUserId, blogId));
    } else {
      blogSaveRepository.save(
          BlogSave.builder()
              .userId(currentUserId)
              .blogId(blogId)
              .build()
      );
    }

    List<BlogSave> blogSaves = blogSaveRepository.findByUserId(currentUserId);
    List<Integer> savedPosts = new ArrayList<>();
    for (BlogSave blogSave : blogSaves) {
      savedPosts.add(blogSave.getBlogId());
    }

    return ToggleSaveResponse.builder()
        .saved(!isSaved)
        .savedPosts(savedPosts)
        .build();
  }

  @Override
  public BlogListResponse getSavedBlogs(Integer authUserId, String userParam, int page, int limit) {
    if (userParam != null && !userParam.trim().isEmpty()) {
      Integer targetUserId = resolveUserId(userParam);
      if (targetUserId != null && !targetUserId.equals(authUserId)) {
        throw new ForbiddenException("Forbidden: You cannot view another user's saved stories");
      }
    }

    Pageable pageable = PageRequest.of(page - 1, limit);
    Page<Blog> savedBlogPage = blogRepository.findSavedBlogsByUserId(authUserId, pageable);

    List<Blog> savedBlogs = savedBlogPage.getContent();
    List<BlogResponse> blogs = new ArrayList<>();
    for (Blog blog : savedBlogs) {
      blogs.add(toFeedResponse(blog));
    }

    return BlogListResponse.builder()
        .blogs(blogs)
        .pagination(PaginationResponse.of(savedBlogPage, page, limit))
        .build();
  }

  @Override
  public BlogListResponse getAllBlogs(int page, int limit) {
    Pageable pageable = PageRequest.of(page - 1, limit);
    Page<Blog> blogPage = blogRepository.findAllByOrderByCreatedAtDesc(pageable);

    List<Blog> blogs = blogPage.getContent();
    List<BlogResponse> blogResponses = new ArrayList<>();
    for (Blog blog : blogs) {
      blogResponses.add(toFeedResponse(blog));
    }

    return BlogListResponse.builder()
        .blogs(blogResponses)
        .pagination(PaginationResponse.of(blogPage, page, limit))
        .build();
  }

  @Override
  public BlogListResponse getLikedBlogs(Integer authUserId, String userParam, int page, int limit) {
    if (userParam != null && !userParam.trim().isEmpty()) {
      Integer targetUserId = resolveUserId(userParam);
      if (targetUserId != null && !targetUserId.equals(authUserId)) {
        throw new ForbiddenException("Forbidden: You cannot view another user's liked stories");
      }
    }

    Pageable pageable = PageRequest.of(page - 1, limit);
    Page<Blog> likedBlogPage = blogRepository.findLikedBlogsByUserId(authUserId, pageable);

    List<Blog> likedBlogs = likedBlogPage.getContent();
    List<BlogResponse> blogs = new ArrayList<>();
    for (Blog blog : likedBlogs) {
      blogs.add(toFeedResponse(blog));
    }

    return BlogListResponse.builder()
        .blogs(blogs)
        .pagination(PaginationResponse.of(likedBlogPage, page, limit))
        .build();
  }

  @Override
  public SearchResultResponse searchEverything(String query, int page, int limit) {
    String cleanQuery = query != null ? query.trim() : "";

    if (cleanQuery.isEmpty()) {
      return SearchResultResponse.builder()
          .blogs(Collections.emptyList())
          .users(Collections.emptyList())
          .pagination(PaginationResponse.empty(limit))
          .build();
    }

    Pageable pageable = PageRequest.of(page - 1, limit);
    Page<Blog> blogPage = blogRepository.searchBlogs(cleanQuery, pageable);
    List<User> matchedUsers = userRepository.searchUsers(cleanQuery, PageRequest.of(0, 10));
    List<UserResponse> users = new ArrayList<>();
    for (User user : matchedUsers) {
      users.add(userMapper.toResponse(user));
    }

    List<Blog> blogs = blogPage.getContent();
    List<BlogResponse> blogResponses = new ArrayList<>();
    for (Blog blog : blogs) {
      blogResponses.add(toFeedResponse(blog));
    }

    return SearchResultResponse.builder()
        .blogs(blogResponses)
        .users(users)
        .pagination(PaginationResponse.of(blogPage, page, limit))
        .build();
  }

  private void saveContentBlocks(Blog blog, List<BlogContentDto> contents) {
    if (contents == null) return;
    int order = 0;
    for (BlogContentDto contentDto : contents) {
      if ("image".equalsIgnoreCase(contentDto.getType()) && contentDto.getContent() != null && contentDto.getContent().trim().startsWith("data:image/")) {
        throw new BadRequestException("Base64 image data is not allowed. Images must be uploaded to storage first.");
      }
      BlogContent blogContent = BlogContent.builder()
          .blog(blog)
          .blockOrder(order++)
          .type(contentDto.getType() != null ? contentDto.getType() : "paragraph")
          .content(contentDto.getContent() != null ? contentDto.getContent() : "")
          .caption(contentDto.getCaption())
          .build();
      blogContentRepository.save(blogContent);
    }
  }

  @Override
  public BlogResponse toResponse(Blog blog) {
    return toResponse(blog, true);
  }

  private BlogResponse toFeedResponse(Blog blog) {
    return toResponse(blog, false);
  }

  private BlogResponse toResponse(Blog blog, boolean includeFullComments) {
    if (blog == null) return null;

    List<BlogContent> blogContents = blogContentRepository.findByBlogIdOrderByBlockOrderAsc(blog.getId());
    List<BlogContentDto> contentDtos = new ArrayList<>();
    for (BlogContent blogContent : blogContents) {
      contentDtos.add(modelMapper.map(blogContent, BlogContentDto.class));
    }

    List<BlogLike> blogLikes = blogLikeRepository.findByBlogId(blog.getId());
    List<Integer> likes = new ArrayList<>();
    for (BlogLike blogLike : blogLikes) {
      likes.add(blogLike.getUserId());
    }

    List<CommentResponse> commentResponses = new ArrayList<>();
    if (includeFullComments) {
      List<Comment> comments = commentRepository.findByBlogIdOrderByCreatedAtDesc(blog.getId());
      for (Comment comment : comments) {
        commentResponses.add(toCommentResponse(comment));
      }
    } else {
      long count = commentRepository.countByBlogId(blog.getId());
      for (int i = 0; i < count; i++) {
        commentResponses.add(new CommentResponse());
      }
    }

    BlogResponse blogResponse = modelMapper.map(blog, BlogResponse.class);
    blogResponse.setContent(contentDtos);
    blogResponse.setAuthor(userMapper.toResponse(blog.getAuthor()));
    blogResponse.setComments(commentResponses);
    blogResponse.setLikes(likes);
    return blogResponse;
  }

  private CommentResponse toCommentResponse(Comment comment) {
    if (comment == null) return null;
    CommentResponse response = modelMapper.map(comment, CommentResponse.class);
    response.setUser(userMapper.toResponse(comment.getUser()));
    response.setBlogId(comment.getBlog() != null ? comment.getBlog().getId() : null);
    return response;
  }
}
