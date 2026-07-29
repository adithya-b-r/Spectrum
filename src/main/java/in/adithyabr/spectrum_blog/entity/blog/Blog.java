package in.adithyabr.spectrum_blog.entity.blog;

import in.adithyabr.spectrum_blog.entity.user.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="blogs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Blog {
  @Id
  @GeneratedValue(strategy= GenerationType.IDENTITY)
  private Integer id;

  @Column(nullable=false)
  @NotBlank
  @Size(min=1, max=150)
  private String title;

  @Size(max=500)
  private String subtitle;

  @ManyToOne(fetch=FetchType.LAZY)
  @JoinColumn(name="author_id", nullable = false)
  private User author;

  @Builder.Default
  private Integer views = 0;

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
}
