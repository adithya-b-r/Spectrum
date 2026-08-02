package in.adithyabr.spectrum_blog.dto.user;

import in.adithyabr.spectrum_blog.entity.user.User;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.validator.constraints.URL;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {
  @Size(min=2, max=150)
  private String fullName;
  @Size(min=3, max=150)
  private String username;
  private String about;
  private String headline;
  private String location;

  @URL(message = "Please enter a valid Website URL (must start with http:// or https://)")
  private String website;

  @URL(message = "Please enter a valid Twitter/X URL (must start with http:// or https://)")
  private String twitter;

  @URL(message = "Please enter a valid GitHub URL (must start with http:// or https://)")
  private String github;

  @URL(message = "Please enter a valid LinkedIn URL (must start with http:// or https://)")
  private String linkedin;

  @URL(message = "Please enter a valid Profile Picture URL")
  private String profilePic;

  @URL(message = "Please enter a valid Banner Picture URL")
  private String bannerPic;
  private User.Visibility visibility;
  private User.Theme theme;
}
