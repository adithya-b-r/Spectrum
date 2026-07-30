package in.adithyabr.spectrum_blog.entity.blogcomment;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="comment_likes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(CommentLikeId.class)
public class CommentLike {
  @Id
  @Column(name="comment_id")
  private Integer commentId;

  @Id
  @Column(name="user_id")
  private Integer userId;

  @Column(name="created_at")
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
