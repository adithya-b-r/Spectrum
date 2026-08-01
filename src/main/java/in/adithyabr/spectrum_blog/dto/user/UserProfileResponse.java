package in.adithyabr.spectrum_blog.dto.user;

import in.adithyabr.spectrum_blog.dto.blog.BlogResponse;
import in.adithyabr.spectrum_blog.dto.pagination.PaginationResponse;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
  private UserResponse user;
  private List<BlogResponse> blogs;
  private PaginationResponse pagination;
}