package in.adithyabr.spectrum_blog.repository.blogcomment;

import in.adithyabr.spectrum_blog.entity.blogcomment.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
  List<Comment> findByBlogIdOrderByCreatedAtDesc(Integer blogId);
  Page<Comment> findByBlogIdOrderByCreatedAtDesc(Integer blogId, Pageable pageable);
  long countByBlogId(Integer blogId);
}

