package in.adithyabr.spectrum_blog.service.auth;

import in.adithyabr.spectrum_blog.dto.auth.AuthResponse;
import in.adithyabr.spectrum_blog.dto.auth.RegisterRequest;

public interface AuthService {
  AuthResponse register(RegisterRequest request);
}