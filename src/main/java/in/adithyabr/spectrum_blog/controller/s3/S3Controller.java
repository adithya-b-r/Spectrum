package in.adithyabr.spectrum_blog.controller.s3;

import in.adithyabr.spectrum_blog.entity.blog.Blog;
import in.adithyabr.spectrum_blog.exception.ForbiddenException;
import in.adithyabr.spectrum_blog.exception.ResourceNotFoundException;
import in.adithyabr.spectrum_blog.exception.UnauthorizedException;
import in.adithyabr.spectrum_blog.repository.blog.BlogRepository;
import in.adithyabr.spectrum_blog.security.UserDetails.CustomUserDetails;
import in.adithyabr.spectrum_blog.service.s3.S3Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/s3")
@RequiredArgsConstructor
public class S3Controller {
  private final S3Service s3Service;
  private final BlogRepository blogRepository;

  @PostMapping("/upload")
  @Transactional(readOnly = true)
  public ResponseEntity<String> upload(
      @AuthenticationPrincipal CustomUserDetails userDetails,
      @RequestParam("file") MultipartFile file,
      @RequestParam(value = "blogId", required = false) Integer blogId
  ) {
    if (userDetails == null) {
      throw new UnauthorizedException("Authentication required. Please sign in.");
    }

    String key;
    if (blogId != null) {
      Blog blog = blogRepository.findById(blogId)
          .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));
      if (!blog.getAuthor().getId().equals(userDetails.getId())) {
        throw new ForbiddenException("Forbidden: You are not authorized to upload images for this blog");
      }
      key = "blogs/" + blogId + "/" + UUID.randomUUID() + "-" + s3Service.sanitizeFileName(file.getOriginalFilename());
    } else {
      key = "blogs/" + UUID.randomUUID() + "-" + s3Service.sanitizeFileName(file.getOriginalFilename());
    }

    String cloudFrontUrl = s3Service.uploadFile(file, key);
    return ResponseEntity.ok(cloudFrontUrl);
  }
}