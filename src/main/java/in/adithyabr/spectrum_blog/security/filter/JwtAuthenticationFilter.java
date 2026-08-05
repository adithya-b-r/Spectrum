package in.adithyabr.spectrum_blog.security.filter;

import in.adithyabr.spectrum_blog.service.jwt.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import in.adithyabr.spectrum_blog.security.UserDetails.CustomUserDetailsService;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  private final JwtService jwtService;
  private final CustomUserDetailsService userDetailsService;

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
  ) throws ServletException, IOException {

    try {
      String token = getToken(request);

      if (token != null && jwtService.isValid(token)) {

        String email = jwtService.extractUsername(token);

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
          UserDetails userDetails =
              userDetailsService.loadUserByUsername(email);

          if (userDetails != null) {
            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                    userDetails,
                    null,
                    userDetails.getAuthorities()
                );

            authentication.setDetails(
                new WebAuthenticationDetailsSource()
                    .buildDetails(request)
            );

            SecurityContextHolder
                .getContext()
                .setAuthentication(authentication);
          }
        }
      }
    } catch (Exception e) {
      SecurityContextHolder.clearContext();
    }

    filterChain.doFilter(request, response);
  }

  private String getToken(HttpServletRequest request) {
    String header = request.getHeader("Authorization");

    if (header != null && header.startsWith("Bearer ") && header.length() > 7) {
      String token = header.substring(7).trim();
      if (!token.isEmpty() && !"null".equalsIgnoreCase(token) && !"undefined".equalsIgnoreCase(token)) {
        return token;
      }
    }

    if (request.getCookies() != null) {
      for (Cookie cookie : request.getCookies()) {
        if ("token".equals(cookie.getName()) && cookie.getValue() != null && !cookie.getValue().isEmpty()) {
          String token = cookie.getValue().trim();
          if (!token.isEmpty() && !"null".equalsIgnoreCase(token) && !"undefined".equalsIgnoreCase(token)) {
            return token;
          }
        }
      }
    }

    return null;
  }
}
