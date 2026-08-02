package in.adithyabr.spectrum_blog.dto.blog;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToggleLikeResponse {
  private boolean liked;
  private long likesCount;
  private List<Integer> likes;
}
