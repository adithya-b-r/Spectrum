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
      @Valid @RequestBody UpdateBlogRequest request
  ) {
    BlogResponse updatedBlog = blogService.updateBlog(userDetails.getId(), id, request);
    return ResponseEntity.ok(
        UpdateBlogResponse.builder()
            .message("Blog updated successfully")
            .blog(updatedBlog)
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

  @PutMapping({"/like/{id}", "/{id}/like"})
  public ResponseEntity<ToggleLikeResponse> toggleLike(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable Integer id
  ) {
    return ResponseEntity.ok(blogService.toggleLike(userDetails.getId(), id));
  }

  @GetMapping({"/likes/{id}", "/{id}/likes"})
  public ResponseEntity<BlogLikesResponse> getLikes(@PathVariable Integer id) {
    return ResponseEntity.ok(blogService.getLikes(id));
  }

  @PostMapping({"/comment/{id}", "/{id}/comment"})
  public ResponseEntity<AddCommentResponse> addComment(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable Integer id,
      @Valid @RequestBody AddCommentRequest request
  ) {
    CommentResponse comment = blogService.addComment(userDetails.getId(), id, request.getContent());
    return ResponseEntity.status(HttpStatus.CREATED).body(
        AddCommentResponse.builder()
            .message("Comment added successfully")
            .comment(comment)
            .build()
    );
  }

  @GetMapping({"/comments/{id}", "/{id}/comments"})
  public ResponseEntity<CommentListResponse> getComments(
      @PathVariable Integer id,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "20") int limit
  ) {
    return ResponseEntity.ok(blogService.getBlogComments(id, page, limit));
  }

  @DeleteMapping({"/comment/{id}", "/{blogId}/comment/{id}", "/comment/{blogId}/{id}"})
  public ResponseEntity<MessageResponse> deleteComment(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable("id") Integer commentId
  ) {
    blogService.deleteComment(userDetails.getId(), commentId);
    return ResponseEntity.ok(
        MessageResponse.builder()
            .message("Comment deleted successfully")
            .build()
    );
  }

  @PutMapping({"/save/{id}", "/{id}/save"})
  public ResponseEntity<ToggleSaveResponse> toggleSave(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable Integer id
  ) {
    return ResponseEntity.ok(blogService.toggleSave(userDetails.getId(), id));
  }

  @GetMapping({"", "/"})
  public ResponseEntity<BlogListResponse> getAllBlogs(
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int limit
  ) {
    return ResponseEntity.ok(blogService.getAllBlogs(page, limit));
  }

  @GetMapping("/search")
  public ResponseEntity<SearchResultResponse> searchEverything(
      @RequestParam(name = "q", required = false) String query,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "12") int limit
  ) {
    return ResponseEntity.ok(blogService.searchEverything(query, page, limit));
  }

  @GetMapping("/liked/{id}")
  public ResponseEntity<BlogListResponse> getLikedBlogs(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable("id") String userId,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int limit
  ) {
    return ResponseEntity.ok(blogService.getLikedBlogs(userDetails.getId(), userId, page, limit));
  }

  @GetMapping("/saved/{id}")
  public ResponseEntity<BlogListResponse> getSavedBlogs(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @PathVariable("id") String userId,
      @RequestParam(defaultValue = "1") int page,
      @RequestParam(defaultValue = "10") int limit
  ) {
    return ResponseEntity.ok(blogService.getSavedBlogs(userDetails.getId(), userId, page, limit));
  }
}
