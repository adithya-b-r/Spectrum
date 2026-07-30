package in.adithyabr.spectrum_blog.repository.blog;

import in.adithyabr.spectrum_blog.entity.blog.Blog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BlogRepository extends JpaRepository<Blog, Integer> {
  List<Blog> findByAuthorIdOrderByCreatedAtDesc(Integer authorId);
  Page<Blog> findByAuthorIdOrderByCreatedAtDesc(Integer authorId, Pageable pageable);
  @Query(value = "SELECT b FROM Blog b JOIN FETCH b.author ORDER BY b.createdAt DESC",
         countQuery = "SELECT count(b) FROM Blog b")
  Page<Blog> findAllByOrderByCreatedAtDesc(Pageable pageable);

  @Query("SELECT b FROM Blog b JOIN BlogSave bs ON b.id = bs.blogId WHERE bs.userId = :userId ORDER BY bs.createdAt DESC")
  Page<Blog> findSavedBlogsByUserId(@Param("userId") Integer userId, Pageable pageable);

  @Query("SELECT b FROM Blog b JOIN BlogLike bl ON b.id = bl.blogId WHERE bl.userId = :userId ORDER BY bl.createdAt DESC")
  Page<Blog> findLikedBlogsByUserId(@Param("userId") Integer userId, Pageable pageable);

  @Query("SELECT DISTINCT b FROM Blog b LEFT JOIN b.author u WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.subtitle) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) ORDER BY b.createdAt DESC")
  Page<Blog> searchBlogs(@Param("keyword") String keyword, Pageable pageable);
}