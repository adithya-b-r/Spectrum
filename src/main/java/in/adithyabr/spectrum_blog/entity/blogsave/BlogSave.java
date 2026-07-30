package in.adithyabr.spectrum_blog.entity.blogsave;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity(name = "BlogSave")
@Table(name="blog_saves")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(BlogSaveId.class)
public class BlogSave {
  @Id
  @Column(name="user_id")
  private Integer userId;

  @Id
  @Column(name="blog_id")
  private Integer blogId;

  @Column(name="created_at")
  private LocalDateTime createdAt;

  @PrePersist
  public void onCreate() {
    createdAt = LocalDateTime.now();
  }
}
