package in.adithyabr.spectrum_blog.dto.user;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSettingsRequest {
  private Integer id;
  private String visibility;
  private String theme;
}
