package in.adithyabr.spectrum_blog.dto.follow;

import in.adithyabr.spectrum_blog.dto.pagination.PaginationResponse;
import in.adithyabr.spectrum_blog.dto.user.UserResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FollowingResponse {
  private List<UserResponse> following;
  private PaginationResponse pagination;
}
