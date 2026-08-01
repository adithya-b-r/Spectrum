package in.adithyabr.spectrum_blog.dto.auth;

import com.fasterxml.jackson.annotation.JsonInclude;
import in.adithyabr.spectrum_blog.dto.user.UserResponse;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthStatusResponse {
  private Boolean authenticated;
  private String message;
  private UserResponse user;
}
