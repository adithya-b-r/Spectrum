package in.adithyabr.spectrum_blog.service.s3;

import org.springframework.web.multipart.MultipartFile;

public interface S3Service {
  String uploadFile(MultipartFile file, String key);
  void deleteFile(String fileUrlOrKey);
  String extractKey(String fileUrlOrKey);
  String sanitizeFileName(String originalFilename);
}
