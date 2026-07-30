package in.adithyabr.spectrum_blog.entity.bloglike;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity(name = "BlogLike")
@Table(name="blog_likes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(BlogLikeId.class)
public class BlogLike {
  @Id
  @Column(name="blog_id")
  private Integer blogId;

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
