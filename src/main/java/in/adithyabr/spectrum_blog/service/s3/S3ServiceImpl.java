package in.adithyabr.spectrum_blog.service.s3;

import in.adithyabr.spectrum_blog.exception.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class S3ServiceImpl implements S3Service {

  private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;
  private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif"
  );

  private final S3Client s3Client;

  @Value("${aws.s3.bucket-name}")
  private String bucketName;

  @Value("${aws.cloudfront.domain}")
  private String cloudFrontDomain;

  @Override
  public String uploadFile(MultipartFile file, String key) {
    validateImage(file);

    PutObjectRequest request = PutObjectRequest.builder()
        .bucket(bucketName)
        .key(key)
        .contentType(file.getContentType())
        .build();

    try (InputStream is = file.getInputStream()) {
      s3Client.putObject(request, RequestBody.fromInputStream(is, file.getSize()));
    } catch (IOException e) {
      throw new RuntimeException("Failed to upload image to storage", e);
    }

    return buildCloudFrontUrl(key);
  }

  @Override
  public void deleteFile(String fileUrlOrKey) {
    if (fileUrlOrKey == null || fileUrlOrKey.trim().isEmpty()) {
      return;
    }
    try {
      String key = extractKey(fileUrlOrKey);
      if (key != null && !key.isEmpty()) {
        s3Client.deleteObject(DeleteObjectRequest.builder()
            .bucket(bucketName)
            .key(key)
            .build());
      }
    } catch (Exception e) {
      log.warn("Failed to delete S3 file '{}': {}", fileUrlOrKey, e.getMessage());
    }
  }

  @Override
  public String extractKey(String fileUrlOrKey) {
    if (fileUrlOrKey == null || fileUrlOrKey.trim().isEmpty() || fileUrlOrKey.trim().startsWith("data:")) {
      return null;
    }

    String url = fileUrlOrKey.trim();
    String domain = cloudFrontDomain != null ? cloudFrontDomain.replaceAll("/+$", "") : "";

    if (!domain.isEmpty() && url.startsWith(domain)) {
      return url.substring(domain.length()).replaceAll("^/+", "");
    }

    if (url.startsWith("http://") || url.startsWith("https://")) {
      try {
        URI uri = URI.create(url);
        String host = uri.getHost();
        String path = uri.getPath();
        if (path == null) {
          return null;
        }
        if ((host != null && host.contains(bucketName)) || (!domain.isEmpty() && domain.contains(host != null ? host : ""))) {
          if (path.startsWith("/" + bucketName + "/")) {
            return path.substring(bucketName.length() + 2);
          } else if (path.startsWith(bucketName + "/")) {
            return path.substring(bucketName.length() + 1);
          }
          return path.replaceAll("^/+", "");
        }
        return null;
      } catch (Exception e) {
        return null;
      }
    }

    if (url.startsWith("blogs/") || url.startsWith("users/")) {
      return url;
    }

    return null;
  }

  @Override
  public String sanitizeFileName(String originalFilename) {
    if (originalFilename == null || originalFilename.trim().isEmpty()) {
      return "image";
    }
    String name = originalFilename.trim();
    int lastSlash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
    if (lastSlash >= 0) {
      name = name.substring(lastSlash + 1);
    }
    return name.replaceAll("[^a-zA-Z0-9._-]", "_");
  }

  private String buildCloudFrontUrl(String key) {
    String domain = cloudFrontDomain.replaceAll("/+$", "");
    String cleanKey = key.replaceAll("^/+", "");
    return domain + "/" + cleanKey;
  }

  private void validateImage(MultipartFile file) {
    if (file == null || file.isEmpty()) {
      throw new BadRequestException("Image file cannot be empty");
    }

    if (file.getSize() > MAX_FILE_SIZE) {
      throw new MaxUploadSizeExceededException(MAX_FILE_SIZE);
    }

    String contentType = file.getContentType();
    if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
      throw new BadRequestException("Unsupported image format. Allowed formats: JPEG, PNG, WEBP, GIF");
    }

    try (InputStream is = file.getInputStream()) {
      byte[] header = new byte[12];
      int read = is.read(header);
      if (read < 4) {
        throw new BadRequestException("Invalid image file");
      }

      boolean isJpeg = (header[0] & 0xFF) == 0xFF && (header[1] & 0xFF) == 0xD8 && (header[2] & 0xFF) == 0xFF;
      boolean isPng = (header[0] & 0xFF) == 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47;
      boolean isGif = header[0] == 'G' && header[1] == 'I' && header[2] == 'F';
      boolean isWebp = read >= 12 && header[0] == 'R' && header[1] == 'I' && header[2] == 'F' && header[3] == 'F'
          && header[8] == 'W' && header[9] == 'E' && header[10] == 'B' && header[11] == 'P';

      if (!isJpeg && !isPng && !isGif && !isWebp) {
        throw new BadRequestException("Invalid image content: MIME type does not match file data");
      }
    } catch (IOException e) {
      throw new BadRequestException("Failed to read image file for validation");
    }
  }
}
