package in.adithyabr.spectrum_blog.dto.user;

import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
  private Integer id;
  private String fullName;
  private String username;
  private String email;
  private String about;
  private String headline;
  private String location;
  private String website;
  private String twitter;
  private String github;
  private String linkedin;
  private String profilePic;
  private String bannerPic;
  private String visibility;
  private String theme;
  private List<String> blogs;
  private List<String> followers;
  private List<String> following;
  private List<String> likedPosts;
  private List<String> savedPosts;
}
