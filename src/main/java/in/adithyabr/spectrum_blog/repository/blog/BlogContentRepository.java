package in.adithyabr.spectrum_blog.repository.blog;

import in.adithyabr.spectrum_blog.entity.blog.BlogContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlogContentRepository extends JpaRepository<BlogContent, Integer> {
  List<BlogContent> findByBlogIdOrderByBlockOrderAsc(Integer blogId);
}
