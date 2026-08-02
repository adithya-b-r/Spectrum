package in.adithyabr.spectrum_blog.dto.blog;

import in.adithyabr.spectrum_blog.dto.pagination.PaginationResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogListResponse {
  private List<BlogResponse> blogs;
  private PaginationResponse pagination;
}
