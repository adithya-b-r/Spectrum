package in.adithyabr.spectrum_blog.controller.notification;

import in.adithyabr.spectrum_blog.dto.common.MessageResponse;
import in.adithyabr.spectrum_blog.dto.notification.NotificationActionResponse;
import in.adithyabr.spectrum_blog.dto.notification.NotificationListResponse;
import in.adithyabr.spectrum_blog.dto.notification.NotificationResponse;
import in.adithyabr.spectrum_blog.dto.notification.UnreadCountResponse;
import in.adithyabr.spectrum_blog.security.UserDetails.CustomUserDetails;
import in.adithyabr.spectrum_blog.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notification")
@RequiredArgsConstructor
public class NotificationController {
  private final NotificationService notificationService;

  @GetMapping({"", "/{id}"})
  public ResponseEntity<NotificationListResponse> getNotifications(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable(name = "id", required = false) String userId
  ) {
    return ResponseEntity.ok(notificationService.getNotifications(userDetails.getId(), userId));
  }

  @GetMapping({"/unread-count", "/unread-count/{id}"})
  public ResponseEntity<UnreadCountResponse> getUnreadCount(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable(name = "id", required = false) String userId
  ) {
    long count = notificationService.getUnreadCount(userDetails.getId(), userId);
    return ResponseEntity.ok(
        UnreadCountResponse.builder()
            .unreadCount(count)
            .build()
    );
  }

  @PutMapping("/read/{id}")
  public ResponseEntity<NotificationActionResponse> markAsRead(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable Integer id
  ) {
    NotificationResponse notification = notificationService.markAsRead(userDetails.getId(), id);
    return ResponseEntity.ok(
        NotificationActionResponse.builder()
            .message("Marked as read")
            .notification(notification)
            .build()
    );
  }

  @PutMapping({"/read-all", "/read-all/{id}"})
  public ResponseEntity<MessageResponse> markAllAsRead(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable(name = "id", required = false) String userId
  ) {
    notificationService.markAllAsRead(userDetails.getId(), userId);
    return ResponseEntity.ok(
        MessageResponse.builder()
            .message("All notifications marked as read")
            .build()
    );
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<MessageResponse> deleteNotification(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable Integer id
  ) {
    notificationService.deleteNotification(userDetails.getId(), id);
    return ResponseEntity.ok(
        MessageResponse.builder()
            .message("Notification deleted")
            .build()
    );
  }

  @DeleteMapping({"/clear-all", "/clear-all/{id}"})
  public ResponseEntity<MessageResponse> clearAllNotifications(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable(name = "id", required = false) String userId
  ) {
    notificationService.clearAllNotifications(userDetails.getId(), userId);
    return ResponseEntity.ok(
        MessageResponse.builder()
            .message("All notifications cleared")
            .build()
    );
  }
}
