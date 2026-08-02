package in.adithyabr.spectrum_blog.dto.blog;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogContentDto {
  private String type;
  private String content;
  private String caption;
}
