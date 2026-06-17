import { describe, it, expect } from "vitest";
import {
  ApiError,
  NotFoundError,
  ValidationError,
  ConflictError,
  InternalError,
} from "../../common/utils/error.util";

describe("ApiError", () => {
  it("creates error with correct properties", () => {
    const error = new ApiError("Something went wrong", 400, "BAD_REQUEST");
    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe("BAD_REQUEST");
    expect(error.name).toBe("ApiError");
  });

  it("is an instance of Error", () => {
    const error = new ApiError("test", 400, "TEST");
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(ApiError);
  });
});

describe("NotFoundError", () => {
  it("creates 404 error with resource and id", () => {
    const error = new NotFoundError("User", "user-123");
    expect(error.statusCode).toBe(404);
    expect(error.errorCode).toBe("NOT_FOUND");
    expect(error.message).toBe("User not found: user-123");
  });
});

describe("ValidationError", () => {
  it("creates 400 error", () => {
    const error = new ValidationError("Invalid email");
    expect(error.statusCode).toBe(400);
    expect(error.errorCode).toBe("VALIDATION_ERROR");
    expect(error.message).toBe("Invalid email");
  });
});

describe("ConflictError", () => {
  it("creates 409 error", () => {
    const error = new ConflictError("Email already exists");
    expect(error.statusCode).toBe(409);
    expect(error.errorCode).toBe("CONFLICT_ERROR");
  });
});

describe("InternalError", () => {
  it("creates 500 error", () => {
    const error = new InternalError("Database connection failed");
    expect(error.statusCode).toBe(500);
    expect(error.errorCode).toBe("INTERNAL_ERROR");
  });
});
