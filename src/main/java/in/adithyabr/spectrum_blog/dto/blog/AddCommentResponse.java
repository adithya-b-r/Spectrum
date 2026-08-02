package in.adithyabr.spectrum_blog.dto.blog;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddCommentResponse {
  private String message;
  private CommentResponse comment;
}
