package in.adithyabr.spectrum_blog.dto.notification;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationListResponse {
  private List<NotificationResponse> notifications;
}
