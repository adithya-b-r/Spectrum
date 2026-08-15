package in.adithyabr.spectrum_blog.service.notification;

import in.adithyabr.spectrum_blog.dto.notification.NotificationListResponse;

public interface NotificationService {
  NotificationListResponse getNotifications(Integer authUserId, String userParam);
  long getUnreadCount(Integer authUserId, String userParam);
}
