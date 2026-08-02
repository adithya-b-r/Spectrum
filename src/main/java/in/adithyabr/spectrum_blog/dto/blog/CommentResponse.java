package in.adithyabr.spectrum_blog.dto.blog;

import in.adithyabr.spectrum_blog.dto.user.UserResponse;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponse {
  private Integer id;
  private String content;
  private UserResponse user;
  private Integer blogId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

}
