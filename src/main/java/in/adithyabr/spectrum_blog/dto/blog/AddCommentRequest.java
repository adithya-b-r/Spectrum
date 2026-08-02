package in.adithyabr.spectrum_blog.dto.blog;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AddCommentRequest {
  private Integer userId;

  @NotBlank(message = "Comment content is required")
  private String content;
}
