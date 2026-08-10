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

  @Override
  public UserResponse updateUser(Integer userId, UpdateUserRequest request) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
      throw new ConflictException("Username already exists");
    }

    applyUserUpdates(user, request);
    userRepository.save(user);

    return toFullResponse(user);
  }

  private void applyUserUpdates(User user, UpdateUserRequest request) {
    if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
      user.setFullName(request.getFullName().trim());
    }
    if (request.getUsername() != null && !request.getUsername().trim().isEmpty()) {
      user.setUsername(request.getUsername().trim());
    }
    if (request.getAbout() != null) {
      user.setAbout(request.getAbout().trim());
    }
    if (request.getHeadline() != null) {
      user.setHeadline(request.getHeadline().trim());
    }
    if (request.getLocation() != null) {
      user.setLocation(request.getLocation().trim());
    }
    if (request.getWebsite() != null) {
      user.setWebsite(request.getWebsite().trim().isEmpty() ? null : request.getWebsite().trim());
    }
    if (request.getTwitter() != null) {
      user.setTwitter(request.getTwitter().trim().isEmpty() ? null : request.getTwitter().trim());
    }
    if (request.getGithub() != null) {
      user.setGithub(request.getGithub().trim().isEmpty() ? null : request.getGithub().trim());
    }
    if (request.getLinkedin() != null) {
      user.setLinkedin(request.getLinkedin().trim().isEmpty() ? null : request.getLinkedin().trim());
    }
    if (request.getProfilePic() != null) {
      user.setProfilePic(request.getProfilePic().trim());
    }
    if (request.getBannerPic() != null) {
      user.setBannerPic(request.getBannerPic().trim());
    }
    if (request.getVisibility() != null) {
      user.setVisibility(request.getVisibility());
    }
    if (request.getTheme() != null) {
      user.setTheme(request.getTheme());
    }
  }

  @Override
  public UserResponse updateAbout(Integer userId, String about) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    user.setAbout(about != null ? about.trim() : "");
    userRepository.save(user);

    return toFullResponse(user);
  }

  @Override
  public UserResponse updateName(Integer userId, String name) {
    if (name == null || name.trim().isEmpty()) {
      throw new BadRequestException("Full name is required.");
    }

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    user.setFullName(name.trim());
    userRepository.save(user);

    return toFullResponse(user);
  }

  @Override
  public UserResponse updateUsername(Integer userId, String username) {
    if (username == null || username.trim().isEmpty()) {
      throw new BadRequestException("Username is required.");
    }

    String cleanUsername = username.replaceFirst("^@", "").trim();

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (!user.getUsername().equals(cleanUsername) && userRepository.existsByUsername(cleanUsername)) {
      throw new ConflictException("Username is already taken.");
    }

    user.setUsername(cleanUsername);
    userRepository.save(user);

    return toFullResponse(user);
  }

  @Override
  public UserResponse updateVisibility(Integer userId, String visibility) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (visibility == null || visibility.trim().isEmpty()) {
      throw new BadRequestException("Invalid visibility option. Allowed: 'PUBLIC', 'PRIVATE'.");
    }

    try {
      user.setVisibility(User.Visibility.valueOf(visibility.trim().toUpperCase()));
    } catch (IllegalArgumentException e) {
      throw new BadRequestException("Invalid visibility option. Allowed: 'PUBLIC', 'PRIVATE'.");
    }
    userRepository.save(user);

    return toFullResponse(user);
  }

  @Override
  public UserResponse updateProfilePic(Integer userId, MultipartFile file) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    String key = "users/" + userId + "/profile/" + UUID.randomUUID() + "-" + s3Service.sanitizeFileName(file.getOriginalFilename());
    String newCloudFrontUrl = s3Service.uploadFile(file, key);

    String oldProfilePic = user.getProfilePic();
    user.setProfilePic(newCloudFrontUrl);
    userRepository.save(user);

    if (oldProfilePic != null && !oldProfilePic.trim().isEmpty()) {
      s3Service.deleteFile(oldProfilePic);
    }

    return toFullResponse(user);
  }

  @Override
  public UserResponse updateBannerPic(Integer userId, MultipartFile file) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    String key = "users/" + userId + "/banner/" + UUID.randomUUID() + "-" + s3Service.sanitizeFileName(file.getOriginalFilename());
    String newCloudFrontUrl = s3Service.uploadFile(file, key);

    String oldBannerPic = user.getBannerPic();
    user.setBannerPic(newCloudFrontUrl);
    userRepository.save(user);

    if (oldBannerPic != null && !oldBannerPic.trim().isEmpty()) {
      s3Service.deleteFile(oldBannerPic);
    }

    return toFullResponse(user);
  }

  @Override
  public void updatePassword(Integer userId, String oldPassword, String newPassword) {
    if (oldPassword == null || oldPassword.trim().isEmpty() || newPassword == null || newPassword.trim().isEmpty()) {
      throw new BadRequestException("Both old and new passwords are required.");
    }

    if (newPassword.length() < 8) {
      throw new BadRequestException("Password must be at least 8 characters long.");
    }

    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found."));

    if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
      throw new BadRequestException("Incorrect current password.");
    }

    user.setPassword(passwordEncoder.encode(newPassword));
    userRepository.save(user);
  }

  @Override
  public UserResponse updateSettings(Integer userId, String visibility, String theme) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found."));

    if (visibility != null && !visibility.trim().isEmpty()) {
      try {
        user.setVisibility(User.Visibility.valueOf(visibility.trim().toUpperCase()));
      } catch (IllegalArgumentException e) {
        throw new BadRequestException("Invalid visibility option. Allowed: 'PUBLIC', 'PRIVATE'.");
      }
    }

    if (theme != null && !theme.trim().isEmpty()) {
      try {
        user.setTheme(User.Theme.valueOf(theme.trim().toUpperCase()));
      } catch (IllegalArgumentException e) {
        throw new BadRequestException("Invalid theme option. Allowed: 'LIGHT', 'DARK', 'SYSTEM'.");
      }
    }

    userRepository.save(user);
    return toFullResponse(user);
  }

  @Override
  public void deleteAccount(Integer authUserId, Integer targetUserId, String password) {
    if (targetUserId != null && !targetUserId.equals(authUserId)) {
      throw new ForbiddenException("Forbidden: You cannot modify another user's account");
    }

    if (password == null || password.trim().isEmpty()) {
      throw new BadRequestException("Password is required to delete account.");
    }

    User user = userRepository.findById(authUserId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found."));

    if (!passwordEncoder.matches(password, user.getPassword())) {
      throw new BadRequestException("Incorrect password.");
    }

    userRepository.delete(user);
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
