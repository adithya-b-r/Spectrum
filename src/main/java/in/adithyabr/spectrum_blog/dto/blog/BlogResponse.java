package in.adithyabr.spectrum_blog.dto.blog;

import in.adithyabr.spectrum_blog.dto.user.UserResponse;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogResponse {
  private Integer id;
  private String title;
  private String subtitle;
  private List<BlogContentDto> content;
  private UserResponse author;
  private Integer views;
  private List<CommentResponse> comments;
  private List<Integer> likes;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

}
