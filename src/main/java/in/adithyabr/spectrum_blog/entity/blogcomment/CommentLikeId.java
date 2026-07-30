package in.adithyabr.spectrum_blog.entity.blogcomment;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class CommentLikeId implements Serializable {
  private Integer commentId;
  private Integer userId;
}
