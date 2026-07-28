package in.adithyabr.spectrum_blog.entity.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDateTime;

@Builder
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(name = "full_name", nullable = false)
  @NotBlank
  @Size(min = 2, max = 150)
  private String fullName;

  @Column(nullable = false, unique = true)
  @NotBlank
  @Email
  @Size(min = 5, max = 150)
  private String email;

  @Column(nullable = false)
  @NotBlank
  @Size(min = 6, max = 255)
  private String password;

  @Column(nullable = false, unique = true)
  @NotBlank
  @Size(min = 2, max = 50)
  private String username;

  @Size(max = 5000)
  private String about;

  @Size(max = 255)
  private String headline;

  private String location;

  private String website;
  private String twitter;
  private String github;
  private String linkedin;

  @URL
  @Column(name = "profile_pic", length = 2048)
  private String profilePic;

  @URL
  @Column(name = "banner_pic", length = 2048)
  private String bannerPic;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @Builder.Default
  private Visibility visibility = Visibility.PUBLIC;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  @Builder.Default
  private Theme theme = Theme.LIGHT;

  @Column(name = "created_at", updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }

  public enum Visibility {
    PUBLIC, PRIVATE
  }

  public enum Theme {
    LIGHT, DARK, SYSTEM
  }
}
