package in.adithyabr.spectrum_blog.dto.blog;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBlogResponse {
  private String message;
  private BlogResponse blog;
}
