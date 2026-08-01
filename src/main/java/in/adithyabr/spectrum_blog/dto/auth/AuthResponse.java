package in.adithyabr.spectrum_blog.dto.auth;

import in.adithyabr.spectrum_blog.dto.user.UserResponse;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
  private String message;
  private String token;
  private UserResponse user;
}
