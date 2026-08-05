package in.adithyabr.spectrum_blog.service.jwt;

import in.adithyabr.spectrum_blog.security.UserDetails.CustomUserDetails;

public interface JwtService {
  String generateToken(CustomUserDetails userDetails);
  boolean isValid(String token);
  String extractUsername(String token);
}
