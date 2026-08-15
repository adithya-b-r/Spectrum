package in.adithyabr.spectrum_blog.service.notification;

import in.adithyabr.spectrum_blog.dto.notification.NotificationListResponse;
import in.adithyabr.spectrum_blog.dto.notification.NotificationResponse;
import in.adithyabr.spectrum_blog.entity.notification.Notification;
import in.adithyabr.spectrum_blog.entity.user.User;
import in.adithyabr.spectrum_blog.exception.ForbiddenException;
import in.adithyabr.spectrum_blog.mapper.UserMapper;
import in.adithyabr.spectrum_blog.repository.notification.NotificationRepository;
import in.adithyabr.spectrum_blog.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
  private final NotificationRepository notificationRepository;
  private final UserRepository userRepository;
  private final UserMapper userMapper;

  @Override
  @Transactional(readOnly = true)
  public NotificationListResponse getNotifications(Integer authUserId, String userParam) {
    validateUserAccess(authUserId, userParam);

    List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(authUserId);
    List<NotificationResponse> responseList = new ArrayList<>();
    for (Notification notification : notifications) {
      responseList.add(toResponse(notification));
    }

    return NotificationListResponse.builder()
        .notifications(responseList)
        .build();
  }

  @Override
  @Transactional(readOnly = true)
  public long getUnreadCount(Integer authUserId, String userParam) {
    validateUserAccess(authUserId, userParam);
    return notificationRepository.countByRecipientIdAndReadFalse(authUserId);
  }

  @Override
  @Transactional
  public NotificationResponse markAsRead(Integer authUserId, Integer notificationId) {
    Notification notification = notificationRepository.findById(notificationId)
        .orElseThrow(() -> new in.adithyabr.spectrum_blog.exception.ResourceNotFoundException("Notification not found"));

    if (!notification.getRecipient().getId().equals(authUserId)) {
      throw new ForbiddenException("Forbidden: You cannot modify another user's notification");
    }

    notification.setRead(true);
    Notification updatedNotification = notificationRepository.save(notification);
    return toResponse(updatedNotification);
  }

  @Override
  @Transactional
  public void markAllAsRead(Integer authUserId, String userParam) {
    validateUserAccess(authUserId, userParam);
    notificationRepository.markAllAsReadByRecipientId(authUserId);
  }

  private void validateUserAccess(Integer authUserId, String userParam) {
    if (userParam != null && !userParam.trim().isEmpty()) {
      Integer targetUserId = resolveUserId(userParam);
      if (targetUserId != null && !targetUserId.equals(authUserId)) {
        throw new ForbiddenException("Forbidden: You cannot access another user's notifications");
      }
    }
  }

  private Integer resolveUserId(String userParam) {
    try {
      return Integer.parseInt(userParam.trim());
    } catch (NumberFormatException ignored) {}

    String cleanUsername = userParam.replaceFirst("^@", "").trim();
    return userRepository.findByUsername(cleanUsername).map(User::getId).orElse(null);
  }

  private NotificationResponse toResponse(Notification notification) {
    if (notification == null) return null;

    NotificationResponse.BlogSummary blogSummary = null;
    if (notification.getBlog() != null) {
      blogSummary = NotificationResponse.BlogSummary.builder()
          .id(notification.getBlog().getId())
          .title(notification.getBlog().getTitle())
          .build();
    }

    NotificationResponse.CommentSummary commentSummary = null;
    if (notification.getComment() != null) {
      commentSummary = NotificationResponse.CommentSummary.builder()
          .id(notification.getComment().getId())
          .content(notification.getComment().getContent())
          .build();
    }

    return NotificationResponse.builder()
        .id(notification.getId())
        .recipient(notification.getRecipient() != null ? notification.getRecipient().getId() : null)
        .sender(userMapper.toResponse(notification.getSender()))
        .type(notification.getType() != null ? notification.getType().name() : null)
        .blog(blogSummary)
        .comment(commentSummary)
        .message(notification.getMessage())
        .read(notification.getRead())
        .createdAt(notification.getCreatedAt())
        .updatedAt(notification.getUpdatedAt())
        .build();
  }
}
