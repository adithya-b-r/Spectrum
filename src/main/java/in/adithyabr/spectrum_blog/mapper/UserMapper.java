package in.adithyabr.spectrum_blog.mapper;

import in.adithyabr.spectrum_blog.dto.user.UserResponse;
import in.adithyabr.spectrum_blog.entity.user.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;

@Component
public class UserMapper {

  public UserResponse toResponse(User user) {
    if (user == null) {
      return null;
    }

    return UserResponse.builder()
        .id(user.getId())
        .fullName(user.getFullName())
        .username(user.getUsername())
        .email(user.getEmail())
        .about(user.getAbout())
        .headline(user.getHeadline())
        .location(user.getLocation())
        .website(user.getWebsite())
        .twitter(user.getTwitter())
        .github(user.getGithub())
        .linkedin(user.getLinkedin())
        .profilePic(user.getProfilePic())
        .bannerPic(user.getBannerPic())
        .visibility(user.getVisibility() != null ? user.getVisibility().name() : null)
        .theme(user.getTheme() != null ? user.getTheme().name() : null)
        .blogs(new ArrayList<String>())
        .followers(new ArrayList<String>())
        .following(new ArrayList<String>())
        .likedPosts(new ArrayList<String>())
        .savedPosts(new ArrayList<String>())
        .build();
  }
}
