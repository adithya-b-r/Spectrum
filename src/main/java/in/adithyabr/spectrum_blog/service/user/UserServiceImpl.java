package in.adithyabr.spectrum_blog.service.user;

import in.adithyabr.spectrum_blog.dto.blog.BlogContentDto;
import in.adithyabr.spectrum_blog.dto.blog.BlogResponse;
import in.adithyabr.spectrum_blog.dto.follow.FollowerResponse;
import in.adithyabr.spectrum_blog.dto.follow.FollowingResponse;
import in.adithyabr.spectrum_blog.dto.follow.ToggleFollowResponse;
import in.adithyabr.spectrum_blog.dto.pagination.PaginationResponse;
import in.adithyabr.spectrum_blog.dto.user.UpdateUserRequest;
import in.adithyabr.spectrum_blog.dto.user.UserProfileResponse;
import in.adithyabr.spectrum_blog.dto.user.UserResponse;
import in.adithyabr.spectrum_blog.entity.blog.Blog;
import in.adithyabr.spectrum_blog.entity.blog.BlogContent;
import in.adithyabr.spectrum_blog.entity.bloglike.BlogLike;
import in.adithyabr.spectrum_blog.entity.blogsave.BlogSave;
import in.adithyabr.spectrum_blog.entity.notification.Notification;
import in.adithyabr.spectrum_blog.entity.user.User;
import in.adithyabr.spectrum_blog.entity.user.UserFollower;
import in.adithyabr.spectrum_blog.entity.user.UserFollowerId;
import in.adithyabr.spectrum_blog.exception.BadRequestException;
import in.adithyabr.spectrum_blog.exception.ConflictException;
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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
  private final UserRepository userRepository;
  private final UserFollowerRepository userFollowerRepository;
  private final PasswordEncoder passwordEncoder;
  private final BlogRepository blogRepository;
  private final BlogContentRepository blogContentRepository;
  private final BlogLikeRepository blogLikeRepository;
  private final BlogSaveRepository blogSaveRepository;
  private final CommentRepository commentRepository;
  private final NotificationRepository notificationRepository;
  private final ModelMapper modelMapper;
  private final UserMapper userMapper;
  private final S3Service s3Service;

  @Override
  public UserResponse getUser(Integer userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    return toFullResponse(user);
  }

  @Override
  public UserProfileResponse getUserProfile(String username, int page, int limit) {
    User user = userRepository.findByUsername(username)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    Pageable pageable = PageRequest.of(page - 1, limit);
    Page<Blog> blogPage = blogRepository.findByAuthorIdOrderByCreatedAtDesc(user.getId(), pageable);

    List<Blog> blogs = blogPage.getContent();
    List<BlogResponse> blogResponses = new ArrayList<>();
    for (Blog blog : blogs) {
      List<BlogContent> blogContents = blogContentRepository.findByBlogIdOrderByBlockOrderAsc(blog.getId());
      List<BlogContentDto> contentDtos = new ArrayList<>();
      for (BlogContent blogContent : blogContents) {
        contentDtos.add(modelMapper.map(blogContent, BlogContentDto.class));
      }
      BlogResponse blogResponse = modelMapper.map(blog, BlogResponse.class);
      blogResponse.setContent(contentDtos);
      blogResponses.add(blogResponse);
    }

    return UserProfileResponse.builder()
        .user(toFullResponse(user))
        .blogs(blogResponses)
        .pagination(PaginationResponse.of(blogPage, page, limit))
        .build();
  }

  @Override
  public FollowerResponse getFollowers(Integer userId, int page, int limit) {
    Pageable pageable = PageRequest.of(page - 1, limit);
    Page<UserFollower> followers = userFollowerRepository.findByFollowingId(userId, pageable);

    List<UserFollower> followerList = followers.getContent();
    List<UserResponse> users = new ArrayList<>();
    for (UserFollower follower : followerList) {
      User user = userRepository.findById(follower.getFollowerId())
          .orElseThrow(() -> new ResourceNotFoundException("Follower not found"));
      users.add(userMapper.toResponse(user));
    }

    return new FollowerResponse(users, PaginationResponse.of(followers, page, limit));
  }

  @Override
  public FollowingResponse getFollowing(Integer userId, int page, int limit) {
    Pageable pageable = PageRequest.of(page - 1, limit);
    Page<UserFollower> followings = userFollowerRepository.findByFollowerId(userId, pageable);

    List<UserFollower> followingList = followings.getContent();
    List<UserResponse> users = new ArrayList<>();
    for (UserFollower following : followingList) {
      User user = userRepository.findById(following.getFollowingId())
          .orElseThrow(() -> new ResourceNotFoundException("Following not found"));
      users.add(userMapper.toResponse(user));
    }

    return new FollowingResponse(users, PaginationResponse.of(followings, page, limit));
  }
  private UserResponse toFullResponse(User user) {
    if (user == null) return null;
    UserResponse response = userMapper.toResponse(user);
    populateUserRelationships(response, user.getId());
    return response;
  }

  private void populateUserRelationships(UserResponse response, Integer userId) {
    List<Blog> userBlogs = blogRepository.findByAuthorIdOrderByCreatedAtDesc(userId);
    List<String> blogIds = new ArrayList<>();
    if (userBlogs != null) {
      for (Blog blog : userBlogs) {
        if (blog != null && blog.getId() != null) {
          blogIds.add(blog.getId().toString());
        }
      }
    }
    response.setBlogs(blogIds);

    List<UserFollower> followerRecords = userFollowerRepository.findByFollowingId(userId);
    List<String> followerIds = new ArrayList<>();
    if (followerRecords != null) {
      for (UserFollower followerRecord : followerRecords) {
        if (followerRecord != null && followerRecord.getFollowerId() != null) {
          followerIds.add(followerRecord.getFollowerId().toString());
        }
      }
    }
    response.setFollowers(followerIds);

    List<UserFollower> followingRecords = userFollowerRepository.findByFollowerId(userId);
    List<String> followingIds = new ArrayList<>();
    if (followingRecords != null) {
      for (UserFollower followingRecord : followingRecords) {
        if (followingRecord != null && followingRecord.getFollowingId() != null) {
          followingIds.add(followingRecord.getFollowingId().toString());
        }
      }
    }
    response.setFollowing(followingIds);

    List<BlogLike> blogLikes = blogLikeRepository.findByUserId(userId);
    List<String> likedIds = new ArrayList<>();
    if (blogLikes != null) {
      for (BlogLike blogLike : blogLikes) {
        if (blogLike != null && blogLike.getBlogId() != null) {
          likedIds.add(blogLike.getBlogId().toString());
        }
      }
    }
    response.setLikedPosts(likedIds);

    List<BlogSave> blogSaves = blogSaveRepository.findByUserId(userId);
    List<String> savedIds = new ArrayList<>();
    if (blogSaves != null) {
      for (BlogSave blogSave : blogSaves) {
        if (blogSave != null && blogSave.getBlogId() != null) {
          savedIds.add(blogSave.getBlogId().toString());
        }
      }
    }
    response.setSavedPosts(savedIds);
  }
}
