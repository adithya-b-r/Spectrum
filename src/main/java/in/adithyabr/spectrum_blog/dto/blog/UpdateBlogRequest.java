package in.adithyabr.spectrum_blog.dto.blog;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateBlogRequest {
  private String title;
  private String subtitle;
  private List<BlogContentDto> content;
}
