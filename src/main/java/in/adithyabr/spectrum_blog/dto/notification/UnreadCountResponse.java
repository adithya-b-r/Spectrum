package in.adithyabr.spectrum_blog.dto.notification;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnreadCountResponse {
  private long unreadCount;
}
