package in.adithyabr.spectrum_blog.controller.blog;

import in.adithyabr.spectrum_blog.dto.blog.*;
import in.adithyabr.spectrum_blog.dto.common.MessageResponse;
import in.adithyabr.spectrum_blog.security.UserDetails.CustomUserDetails;
import in.adithyabr.spectrum_blog.service.blog.BlogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/blog")
@RequiredArgsConstructor
public class BlogController {
  private final BlogService blogService;

  @PostMapping("/create")
  public ResponseEntity<CreateBlogResponse> createBlog(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @Valid @RequestBody CreateBlogRequest request
  ) {
    BlogResponse blog = blogService.createBlog(userDetails.getId(), request);
    return ResponseEntity.status(HttpStatus.CREATED).body(
        CreateBlogResponse.builder()
            .message("Blog created successfully")
            .blog(blog)
            .build()
    );
  }

  @GetMapping("/{id}")
  public ResponseEntity<BlogResponse> getSingleBlog(@PathVariable Integer id) {
    return ResponseEntity.ok(blogService.getSingleBlog(id));
  }

  @GetMapping("/user/{id}")
  public ResponseEntity<BlogListResponse> getUserBlogs(
      @PathVariable("id") String userId,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int limit
  ) {
    return ResponseEntity.ok(blogService.getUserBlogs(userId, page, limit));
  }

  @PutMapping("/{id}")
  public ResponseEntity<UpdateBlogResponse> updateBlog(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable Integer id,
      @RequestBody UpdateBlogRequest request
  ) {
    BlogResponse blog = blogService.updateBlog(userDetails.getId(), id, request);
    return ResponseEntity.ok(
        UpdateBlogResponse.builder()
            .message("Blog updated successfully")
            .blog(blog)
            .build()
    );
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<MessageResponse> deleteBlog(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable Integer id
  ) {
    blogService.deleteBlog(userDetails.getId(), id);
    return ResponseEntity.ok(
        MessageResponse.builder()
            .message("Blog deleted successfully")
            .build()
    );
  }
}
