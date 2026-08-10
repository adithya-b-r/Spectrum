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
  UserResponse updateUser(Integer userId, UpdateUserRequest request);
  UserResponse updateAbout(Integer userId, String about);
  UserResponse updateName(Integer userId, String name);
  UserResponse updateUsername(Integer userId, String username);
  UserResponse updateVisibility(Integer userId, String visibility);
  UserResponse updateProfilePic(Integer userId, MultipartFile file);
  UserResponse updateBannerPic(Integer userId, MultipartFile file);
  void updatePassword(Integer userId, String oldPassword, String newPassword);
  UserResponse updateSettings(Integer userId, String visibility, String theme);
  void deleteAccount(Integer authUserId, Integer targetUserId, String password);
}
