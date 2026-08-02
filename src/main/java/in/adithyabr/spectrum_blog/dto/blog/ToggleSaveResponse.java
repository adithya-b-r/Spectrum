package in.adithyabr.spectrum_blog.dto.blog;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToggleSaveResponse {
  private boolean saved;
  private List<Integer> savedPosts;
}
