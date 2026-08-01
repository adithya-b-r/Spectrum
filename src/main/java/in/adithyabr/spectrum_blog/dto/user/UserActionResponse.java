package in.adithyabr.spectrum_blog.dto.user;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserActionResponse {
  private String message;
  private UserResponse user;
}
