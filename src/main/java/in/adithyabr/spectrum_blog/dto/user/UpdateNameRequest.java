package in.adithyabr.spectrum_blog.dto.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNameRequest {
  private Integer id;

  @NotBlank(message = "Full name is required")
  private String name;
}
