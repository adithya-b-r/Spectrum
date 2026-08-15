package in.adithyabr.spectrum_blog.service.notification;

import in.adithyabr.spectrum_blog.dto.notification.NotificationListResponse;
import in.adithyabr.spectrum_blog.dto.notification.NotificationResponse;

public interface NotificationService {
  NotificationListResponse getNotifications(Integer authUserId, String userParam);
  long getUnreadCount(Integer authUserId, String userParam);
  NotificationResponse markAsRead(Integer authUserId, Integer notificationId);
  void markAllAsRead(Integer authUserId, String userParam);
}
