package in.adithyabr.spectrum_blog.controller.auth;

import in.adithyabr.spectrum_blog.dto.auth.AuthResponse;
import in.adithyabr.spectrum_blog.dto.auth.AuthStatusResponse;
import in.adithyabr.spectrum_blog.dto.auth.LoginRequest;
import in.adithyabr.spectrum_blog.dto.auth.RegisterRequest;
import in.adithyabr.spectrum_blog.dto.common.MessageResponse;
import in.adithyabr.spectrum_blog.dto.user.UserResponse;
import in.adithyabr.spectrum_blog.security.UserDetails.CustomUserDetails;
import in.adithyabr.spectrum_blog.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
  private final AuthService authService;

  private ResponseCookie createAuthCookie(String token, long maxAge) {
    return ResponseCookie.from("token", token != null ? token : "")
        .httpOnly(true)
        .path("/")
        .maxAge(maxAge)
        .sameSite("Lax")
        .build();
  }

  @PostMapping("/register")
  public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
    AuthResponse authResponse = authService.register(request);
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, createAuthCookie(authResponse.getToken(), 7 * 24 * 60 * 60).toString())
        .body(authResponse);
  }

  @PostMapping("/login")
  public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
    AuthResponse authResponse = authService.login(request);
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, createAuthCookie(authResponse.getToken(), 7 * 24 * 60 * 60).toString())
        .body(authResponse);
  }

  @GetMapping("/isauth")
  public ResponseEntity<AuthStatusResponse> isAuth(@AuthenticationPrincipal CustomUserDetails userDetails) {
    if (userDetails == null) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
          AuthStatusResponse.builder()
              .authenticated(false)
              .message("Unauthorized")
              .build()
      );
    }
    UserResponse user = authService.getUserDetails(userDetails.getId());
    return ResponseEntity.ok(
        AuthStatusResponse.builder()
            .authenticated(true)
            .user(user)
            .build()
    );
  }

  @GetMapping({"/logout", "/signout"})
  public ResponseEntity<MessageResponse> logout() {
    return ResponseEntity.ok()
        .header(HttpHeaders.SET_COOKIE, createAuthCookie("", 0).toString())
        .body(
            MessageResponse.builder()
                .message("Successfully logged out")
                .build()
        );
  }
}
