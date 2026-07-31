package in.adithyabr.spectrum_blog.repository.notification;

import in.adithyabr.spectrum_blog.entity.notification.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
  List<Notification> findByRecipientIdOrderByCreatedAtDesc(Integer recipientId);

  long countByRecipientIdAndReadFalse(Integer recipientId);

  @Modifying
  @Query("UPDATE Notification n SET n.read = true WHERE n.recipient.id = :recipientId AND n.read = false")
  void markAllAsReadByRecipientId(@Param("recipientId") Integer recipientId);

  @Modifying
  @Query("DELETE FROM Notification n WHERE n.recipient.id = :recipientId")
  void deleteAllByRecipientId(@Param("recipientId") Integer recipientId);
}

