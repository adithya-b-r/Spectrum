package in.adithyabr.spectrum_blog.entity.notification;

import in.adithyabr.spectrum_blog.entity.blog.Blog;
import in.adithyabr.spectrum_blog.entity.blogcomment.Comment;
import in.adithyabr.spectrum_blog.entity.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {
  @Id
  @GeneratedValue(strategy= GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="recipient_id", nullable=false)
  private User recipient;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="sender_id", nullable = false)
  private User sender;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private NotificationType type;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name="blog_id")
  private Blog blog;

  @ManyToOne(fetch=FetchType.LAZY)
  @JoinColumn(name="comment_id")
  private Comment comment;

  @Size(max = 500)
  private String message;

  @Builder.Default
  @Column(name="is_read", nullable=false)
  private Boolean read = false;

  @Column(name="created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name="updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }

  public enum NotificationType {
    LIKE, COMMENT, FOLLOW, STORY
  }
}
