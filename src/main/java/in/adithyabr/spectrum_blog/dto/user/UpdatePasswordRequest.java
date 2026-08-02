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
public class UpdatePasswordRequest {
  private Integer id;

  @NotBlank(message = "Current password is required")
  private String oldPassword;

  @NotBlank(message = "New password is required")
  private String newPassword;
}
