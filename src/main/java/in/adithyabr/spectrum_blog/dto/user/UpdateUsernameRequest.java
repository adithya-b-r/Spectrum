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
public class UpdateUsernameRequest {
  private Integer id;

  @NotBlank(message = "Username is required")
  private String username;
}
