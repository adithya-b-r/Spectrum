package in.adithyabr.spectrum_blog.entity.user;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name="user_followers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(UserFollowerId.class)
public class UserFollower {
  @Id
  @Column(name="follower_id")
  private Integer followerId;

  @Id
  @Column(name="following_id")
  private Integer followingId;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @PrePersist
  public void prePersist() {
    createdAt = LocalDateTime.now();
  }
}
