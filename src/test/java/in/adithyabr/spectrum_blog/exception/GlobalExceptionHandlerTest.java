package in.adithyabr.spectrum_blog.exception;

import in.adithyabr.spectrum_blog.dto.common.ErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

  private GlobalExceptionHandler exceptionHandler;

  @BeforeEach
  void setUp() {
    exceptionHandler = new GlobalExceptionHandler();
  }

  @Test
  void testHandleResourceNotFoundException() {
    ResourceNotFoundException ex = new ResourceNotFoundException("Blog not found");
    ResponseEntity<ErrorResponse> response = exceptionHandler.handleResourceNotFoundException(ex);

    assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(404, response.getBody().getStatus());
    assertEquals("Blog not found", response.getBody().getMessage());
    assertNotNull(response.getBody().getTimestamp());
  }

  @Test
  void testHandleBadRequestException() {
    BadRequestException ex = new BadRequestException("Invalid input");
    ResponseEntity<ErrorResponse> response = exceptionHandler.handleBadRequestException(ex);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(400, response.getBody().getStatus());
    assertEquals("Invalid input", response.getBody().getMessage());
  }

  @Test
  void testHandleUnauthorizedException() {
    UnauthorizedException ex = new UnauthorizedException("Invalid email or password.");
    ResponseEntity<ErrorResponse> response = exceptionHandler.handleUnauthorizedException(ex);

    assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(401, response.getBody().getStatus());
    assertEquals("Invalid email or password.", response.getBody().getMessage());
  }

  @Test
  void testHandleForbiddenException() {
    ForbiddenException ex = new ForbiddenException("You cannot modify another user's account");
    ResponseEntity<ErrorResponse> response = exceptionHandler.handleForbiddenException(ex);

    assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(403, response.getBody().getStatus());
    assertEquals("You cannot modify another user's account", response.getBody().getMessage());
  }

  @Test
  void testHandleConflictException() {
    ConflictException ex = new ConflictException("Username already exists");
    ResponseEntity<ErrorResponse> response = exceptionHandler.handleConflictException(ex);

    assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(409, response.getBody().getStatus());
    assertEquals("Username already exists", response.getBody().getMessage());
  }

  @Test
  void testHandleMethodArgumentNotValidException() throws NoSuchMethodException {
    Method method = this.getClass().getDeclaredMethod("testHandleMethodArgumentNotValidException");
    MethodParameter parameter = new MethodParameter(method, -1);
    BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "target");
    bindingResult.addError(new FieldError("target", "email", "Invalid email format"));
    bindingResult.addError(new FieldError("target", "password", "Password is required"));

    MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);
    ResponseEntity<ErrorResponse> response = exceptionHandler.handleMethodArgumentNotValidException(ex);

    assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(400, response.getBody().getStatus());
    assertEquals("Validation failed", response.getBody().getMessage());
    assertNotNull(response.getBody().getErrors());
    assertEquals("Invalid email format", response.getBody().getErrors().get("email"));
    assertEquals("Password is required", response.getBody().getErrors().get("password"));
  }

  @Test
  void testHandleMaxUploadSizeExceededException() {
    MaxUploadSizeExceededException ex = new MaxUploadSizeExceededException(10 * 1024 * 1024);
    ResponseEntity<ErrorResponse> response = exceptionHandler.handleMaxUploadSizeExceededException(ex);

    assertEquals(HttpStatus.CONTENT_TOO_LARGE, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(413, response.getBody().getStatus());
    assertEquals("File size exceeds maximum upload limit", response.getBody().getMessage());
  }

  @Test
  void testHandleGenericException() {
    Exception ex = new RuntimeException("Unexpected internal DB error");
    ResponseEntity<ErrorResponse> response = exceptionHandler.handleGenericException(ex);

    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    assertNotNull(response.getBody());
    assertEquals(500, response.getBody().getStatus());
    assertEquals("An unexpected error occurred. Please try again later.", response.getBody().getMessage());
    assertFalse(response.getBody().getMessage().contains("DB error"));
  }
}
