package in.adithyabr.spectrum_blog.dto.notification;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationActionResponse {
  private String message;
  private NotificationResponse notification;
}
