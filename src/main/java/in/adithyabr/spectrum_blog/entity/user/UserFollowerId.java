package in.adithyabr.spectrum_blog.entity.user;

import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserFollowerId implements Serializable {
  private Integer followerId;
  private Integer followingId;
}
