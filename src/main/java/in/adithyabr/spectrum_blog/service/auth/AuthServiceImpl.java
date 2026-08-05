package in.adithyabr.spectrum_blog.service.auth;

import in.adithyabr.spectrum_blog.dto.auth.AuthResponse;
import in.adithyabr.spectrum_blog.dto.auth.RegisterRequest;
import in.adithyabr.spectrum_blog.entity.user.User;
import in.adithyabr.spectrum_blog.exception.BadRequestException;
import in.adithyabr.spectrum_blog.exception.ConflictException;
import in.adithyabr.spectrum_blog.mapper.UserMapper;
import in.adithyabr.spectrum_blog.repository.user.UserRepository;
import in.adithyabr.spectrum_blog.security.UserDetails.CustomUserDetails;
import in.adithyabr.spectrum_blog.service.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
  private final UserRepository userRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;
  private final UserMapper userMapper;

  @Override
  public AuthResponse register(RegisterRequest request) {
    if (request.getConfirmPassword() != null && !request.getConfirmPassword().isEmpty() && !request.getPassword().equals(request.getConfirmPassword())) {
      throw new BadRequestException("Passwords do not match");
    }
    if (userRepository.existsByEmail(request.getEmail())) {
      throw new ConflictException("You already have an account. Please sign in.");
    }
    String username = request.getUsername();
    if (username == null || username.trim().isEmpty()) {
      String baseUsername = request.getEmail().split("@")[0].toLowerCase().trim().replaceAll("[^a-zA-Z0-9_]", "");
      if (baseUsername.isEmpty()) baseUsername = "user";
      username = baseUsername;
      Random random = new Random();
      while (userRepository.existsByUsername(username)) {
        username = baseUsername + "_" + (1000 + random.nextInt(9000));
      }
    } else if (userRepository.existsByUsername(username)) {
      throw new ConflictException("Username already exists");
    }
    User user = new User();
    user.setFullName(request.getFullName());
    user.setEmail(request.getEmail());
    user.setUsername(username);
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    User savedUser = userRepository.save(user);
    String token = jwtService.generateToken(new CustomUserDetails(savedUser));
    return AuthResponse.builder().message("Registration successful").token(token).user(userMapper.toResponse(savedUser)).build();
  }
}