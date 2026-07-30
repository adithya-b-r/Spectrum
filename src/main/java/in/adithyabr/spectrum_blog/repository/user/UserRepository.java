package in.adithyabr.spectrum_blog.repository.user;

import in.adithyabr.spectrum_blog.entity.user.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
  Optional<User> findByEmail(String email);
  Optional<User> findByUsername(String username);

  boolean existsByEmail(String email);
  boolean existsByUsername(String username);

  @Query("SELECT u FROM User u WHERE LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.about) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.headline) LIKE LOWER(CONCAT('%', :keyword, '%'))")
  List<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);
}

