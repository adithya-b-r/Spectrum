package in.adithyabr.spectrum_blog.repository.bloglike;

import in.adithyabr.spectrum_blog.entity.bloglike.BlogLike;
import in.adithyabr.spectrum_blog.entity.bloglike.BlogLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlogLikeRepository extends JpaRepository<BlogLike, BlogLikeId> {
  boolean existsByBlogIdAndUserId(Integer blogId, Integer userId);
  List<BlogLike> findByBlogId(Integer blogId);
  List<BlogLike> findByUserId(Integer userId);
  long countByBlogId(Integer blogId);
}
