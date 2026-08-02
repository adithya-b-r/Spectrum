package in.adithyabr.spectrum_blog.dto.follow;

import in.adithyabr.spectrum_blog.dto.pagination.PaginationResponse;
import in.adithyabr.spectrum_blog.dto.user.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class FollowerResponse {
  private List<UserResponse> followers;
  private PaginationResponse pagination;
}
