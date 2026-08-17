package in.adithyabr.spectrum_blog.dto.blog;

import in.adithyabr.spectrum_blog.dto.pagination.PaginationResponse;
import in.adithyabr.spectrum_blog.dto.user.UserResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SearchResultResponse {
  private List<BlogResponse> blogs;
  private List<UserResponse> users;
  private PaginationResponse pagination;
}
