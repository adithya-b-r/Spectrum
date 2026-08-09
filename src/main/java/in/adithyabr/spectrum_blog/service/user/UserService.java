package in.adithyabr.spectrum_blog.service.user;

import in.adithyabr.spectrum_blog.dto.follow.FollowerResponse;
import in.adithyabr.spectrum_blog.dto.follow.FollowingResponse;
import in.adithyabr.spectrum_blog.dto.follow.ToggleFollowResponse;
import in.adithyabr.spectrum_blog.dto.user.UpdateUserRequest;
import in.adithyabr.spectrum_blog.dto.user.UserProfileResponse;
import in.adithyabr.spectrum_blog.dto.user.UserResponse;

import org.springframework.web.multipart.MultipartFile;

public interface UserService {
  UserResponse getUser(Integer userId);
  UserProfileResponse getUserProfile(String username, int page, int limit);
  FollowerResponse getFollowers(Integer userId, int page, int limit);
  FollowingResponse getFollowing(Integer userId, int page, int limit);
}
