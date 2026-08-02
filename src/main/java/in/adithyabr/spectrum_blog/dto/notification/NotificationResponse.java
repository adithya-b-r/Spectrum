package in.adithyabr.spectrum_blog.dto.notification;

import in.adithyabr.spectrum_blog.dto.user.UserResponse;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
  private Integer id;
  private Integer recipient;
  private UserResponse sender;
  private String type;
  private BlogSummary blog;
  private CommentSummary comment;
  private String message;
  private Boolean read;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class BlogSummary {
    private Integer id;
    private String title;
  }

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class CommentSummary {
    private Integer id;
    private String content;
  }
}
