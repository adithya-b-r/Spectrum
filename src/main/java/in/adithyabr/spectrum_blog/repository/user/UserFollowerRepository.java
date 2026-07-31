package in.adithyabr.spectrum_blog.repository.user;

import in.adithyabr.spectrum_blog.entity.user.UserFollower;
import in.adithyabr.spectrum_blog.entity.user.UserFollowerId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserFollowerRepository extends JpaRepository<UserFollower, UserFollowerId> {

  List<UserFollower> findByFollowerId(Integer followerId);

  List<UserFollower> findByFollowingId(Integer followingId);

  Page<UserFollower> findByFollowerId(Integer followerId, Pageable pageable);

  Page<UserFollower> findByFollowingId(Integer followingId, Pageable pageable);

  boolean existsByFollowerIdAndFollowingId(Integer followerId, Integer followingId);
}