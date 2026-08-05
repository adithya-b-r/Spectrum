package in.adithyabr.spectrum_blog.service.auth;

import in.adithyabr.spectrum_blog.dto.auth.AuthResponse;
import in.adithyabr.spectrum_blog.dto.auth.LoginRequest;
import in.adithyabr.spectrum_blog.dto.auth.RegisterRequest;
import in.adithyabr.spectrum_blog.dto.user.UserResponse;

public interface AuthService {
  AuthResponse register(RegisterRequest request);
  AuthResponse login(LoginRequest request);
  UserResponse getUserDetails(Integer userId);
}
