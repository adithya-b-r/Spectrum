package in.adithyabr.spectrum_blog.controller.user;

import in.adithyabr.spectrum_blog.dto.common.MessageResponse;
import in.adithyabr.spectrum_blog.dto.follow.FollowerResponse;
import in.adithyabr.spectrum_blog.dto.follow.FollowingResponse;
import in.adithyabr.spectrum_blog.dto.follow.ToggleFollowResponse;
import in.adithyabr.spectrum_blog.dto.user.*;
import in.adithyabr.spectrum_blog.security.UserDetails.CustomUserDetails;
import in.adithyabr.spectrum_blog.service.user.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/user")
public class UserController {
  private final UserService userService;

  public UserController(UserService userService) {
    this.userService = userService;
  }

  @PutMapping("/update-name")
  public ResponseEntity<UserActionResponse> updateName(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody UpdateNameRequest request
  ) {
    UserResponse updatedUser = userService.updateName(userDetails.getId(), request.getName());
    return ResponseEntity.ok(
        UserActionResponse.builder()
            .message("Updated user name successfully")
            .user(updatedUser)
            .build()
    );
  }

  @PutMapping("/update-username")
  public ResponseEntity<UserActionResponse> updateUsername(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody UpdateUsernameRequest request
  ) {
    UserResponse updatedUser = userService.updateUsername(userDetails.getId(), request.getUsername());
    return ResponseEntity.ok(
        UserActionResponse.builder()
            .message("Updated username successfully")
            .user(updatedUser)
            .build()
    );
  }

  @PutMapping("/update-profile-visibility")
  public ResponseEntity<UserActionResponse> updateProfileVisibility(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody UpdateVisibilityRequest request
  ) {
    UserResponse updatedUser = userService.updateVisibility(userDetails.getId(), request.getVisibility());
    return ResponseEntity.ok(
        UserActionResponse.builder()
            .message("Updated profile visibility successfully.")
            .user(updatedUser)
            .build()
    );
  }

  @PutMapping("/update-profile-pic")
  public ResponseEntity<UserActionResponse> updateProfilePic(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @RequestParam("file") MultipartFile file
  ) {
    UserResponse updatedUser = userService.updateProfilePic(userDetails.getId(), file);
    return ResponseEntity.ok(
        UserActionResponse.builder()
            .message("Profile photo updated successfully.")
            .user(updatedUser)
            .build()
    );
  }

  @PutMapping("/update-banner-pic")
  public ResponseEntity<UserActionResponse> updateBannerPic(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @RequestParam("file") MultipartFile file
  ) {
    UserResponse updatedUser = userService.updateBannerPic(userDetails.getId(), file);
    return ResponseEntity.ok(
        UserActionResponse.builder()
            .message("Banner updated successfully.")
            .user(updatedUser)
            .build()
    );
  }

  @PutMapping("/update-password")
  public ResponseEntity<MessageResponse> updatePassword(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody UpdatePasswordRequest request
  ) {
    userService.updatePassword(userDetails.getId(), request.getOldPassword(), request.getNewPassword());
    return ResponseEntity.ok(
        MessageResponse.builder()
            .message("Password updated successfully.")
            .build()
    );
  }

  @PutMapping("/update-settings")
  public ResponseEntity<UserActionResponse> updateSettings(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody UpdateSettingsRequest request
  ) {
    UserResponse updatedUser = userService.updateSettings(userDetails.getId(), request.getVisibility(), request.getTheme());
    return ResponseEntity.ok(
        UserActionResponse.builder()
            .message("Settings updated successfully.")
            .user(updatedUser)
            .build()
    );
  }

  @PutMapping("/update-about")
  public ResponseEntity<UserActionResponse> updateAbout(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody UpdateAboutRequest request
  ) {
    UserResponse updatedUser = userService.updateAbout(userDetails.getId(), request.getAbout());
    return ResponseEntity.ok(
        UserActionResponse.builder()
            .message("Updated about successfully.")
            .user(updatedUser)
            .build()
    );
  }

  @PutMapping("/update-profile")
  public ResponseEntity<UserResponse> updateProfile(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody UpdateUserRequest request
  ) {
    return ResponseEntity.ok(userService.updateUser(userDetails.getId(), request));
  }

  @DeleteMapping("/delete-account")
  public ResponseEntity<MessageResponse> deleteAccount(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody DeleteAccountRequest request
  ) {
    userService.deleteAccount(userDetails.getId(), request.getId(), request.getPassword());
    return ResponseEntity.ok(
        MessageResponse.builder()
            .message("Account deleted successfully.")
            .build()
    );
  }

  @PutMapping("/follow/{id}")
  @GetMapping("/profile/{username}")
  public ResponseEntity<UserProfileResponse> profile(
      @PathVariable String username,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int limit
  ) {
    return ResponseEntity.ok(userService.getUserProfile(username, page, limit));
  }

  @GetMapping({"/followers/{id}", "/{id}/followers"})
  @GetMapping({"/following/{id}", "/{id}/following"})
}
