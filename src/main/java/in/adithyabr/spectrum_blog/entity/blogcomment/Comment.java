package in.adithyabr.spectrum_blog.entity.blogcomment;

import in.adithyabr.spectrum_blog.entity.blog.Blog;
import in.adithyabr.spectrum_blog.entity.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
  @Id
  @GeneratedValue(strategy= GenerationType.IDENTITY)
  private int id;

  @Column(nullable=false, columnDefinition = "TEXT")
  @NotBlank
  private String content;

  @ManyToOne(fetch=FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch=FetchType.LAZY)
  @JoinColumn(name="blog_id", nullable = false)
  private Blog blog;

  @Column(name="created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name="updated_at", nullable = false)
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
}