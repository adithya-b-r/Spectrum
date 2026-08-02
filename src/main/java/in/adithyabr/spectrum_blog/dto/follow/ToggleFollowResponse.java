package in.adithyabr.spectrum_blog.dto.follow;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToggleFollowResponse {
  private boolean following;
  private long followersCount;
  private long followingCount;
}
