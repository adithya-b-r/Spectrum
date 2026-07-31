package in.adithyabr.spectrum_blog.repository.blogsave;

import in.adithyabr.spectrum_blog.entity.blogsave.BlogSave;
import in.adithyabr.spectrum_blog.entity.blogsave.BlogSaveId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlogSaveRepository extends JpaRepository<BlogSave, BlogSaveId> {
  boolean existsByUserIdAndBlogId(Integer userId, Integer blogId);
  List<BlogSave> findByUserId(Integer userId);
}
