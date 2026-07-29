package in.adithyabr.spectrum_blog.entity.blog;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(name="blog_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogContent {
  @Id
  @GeneratedValue(strategy= GenerationType.IDENTITY)
  private Integer id;

  @ManyToOne(fetch=FetchType.LAZY)
  @JoinColumn(name="blog_id", nullable=false)
  private Blog blog;

  @NotNull
  @Column(name="block_order", nullable=false)
  private Integer blockOrder;

  @NotBlank
  @Size(max=50)
  @Column(nullable=false)
  private String type;

  @NotBlank
  @Column(nullable=false, columnDefinition="LONGTEXT")
  private String content;

  @Column(columnDefinition = "TEXT")
  private String caption;
}
