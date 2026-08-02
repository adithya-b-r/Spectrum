package in.adithyabr.spectrum_blog.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfilePicRequest {
  private Integer id;

  @NotBlank(message = "Profile picture URL is required")
  private String profilePic;
}
