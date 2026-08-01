package in.adithyabr.spectrum_blog.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
  @NotBlank(message = "Email is required")
  @Email(message = "Invalid email address format")
  private String email;

  @NotBlank(message = "Password is required")
  private String password;
}
