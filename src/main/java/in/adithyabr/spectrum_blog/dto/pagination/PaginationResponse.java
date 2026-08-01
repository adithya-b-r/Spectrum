package in.adithyabr.spectrum_blog.dto.pagination;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaginationResponse {
  private long total;
  private int page;
  private int limit;
  private int totalPages;
  private boolean hasNextPage;
  private boolean hasPreviousPage;

  public static PaginationResponse of(Page<?> pageData, int page, int limit) {
    int totalPages = pageData.getTotalPages();
    return new PaginationResponse(
        pageData.getTotalElements(),
        page,
        limit,
        totalPages > 0 ? totalPages : 1,
        page < totalPages,
        page > 1
    );
  }

  public static PaginationResponse empty(int limit) {
    return new PaginationResponse(
        0,
        1,
        limit,
        1,
        false,
        false
    );
  }
}
