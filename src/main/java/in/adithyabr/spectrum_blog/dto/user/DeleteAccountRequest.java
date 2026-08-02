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
public class DeleteAccountRequest {
  private Integer id;

  @NotBlank(message = "Password is required to delete account")
  private String password;
}
