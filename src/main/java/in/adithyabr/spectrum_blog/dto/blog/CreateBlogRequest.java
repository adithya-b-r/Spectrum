package in.adithyabr.spectrum_blog.dto.blog;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBlogRequest {
  @NotBlank(message = "Title is required")
  private String title;

  private String subtitle;

  @NotEmpty(message = "Content is required")
  private List<BlogContentDto> content;
}
