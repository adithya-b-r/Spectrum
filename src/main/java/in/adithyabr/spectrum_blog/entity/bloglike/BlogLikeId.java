package in.adithyabr.spectrum_blog.entity.bloglike;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class BlogLikeId implements Serializable {
  private Integer blogId;
  private Integer userId;
}
