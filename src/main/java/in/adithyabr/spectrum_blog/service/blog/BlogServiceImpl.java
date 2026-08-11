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
  @Override
  @Transactional
  @Override
  @Transactional
  @Override
  @Transactional
  @Override
  @Transactional
  @Override
  @Transactional
  @Override
  @Transactional
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
