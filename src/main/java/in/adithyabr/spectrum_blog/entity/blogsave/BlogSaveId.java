package in.adithyabr.spectrum_blog.entity.blogsave;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class BlogSaveId implements Serializable {
  private Integer userId;
  private Integer blogId;
}
