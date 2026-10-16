import { describe, expect, it } from "@jest/globals";

import { loginSchema } from "./login.schema";
import { registerSchema } from "./register.schema";
import { resetPasswordSchema } from "./reset-password.schema";

describe("loginSchema", () => {
  it("accepts a valid email and password", () => {
    const result = loginSchema.safeParse({
      email: "coach@example.com",
      password: "hunter2hunter2",
    });

    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "hunter2hunter2",
    });

    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "coach@example.com",
      password: "",
    });

    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const valid = {
    firstName: "Alex",
    lastName: "Morgan",
    email: "alex@example.com",
    password: "supersecure1",
    confirmPassword: "supersecure1",
  };

  it("accepts complete matching input", () => {
    expect(registerSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...valid,
      confirmPassword: "different1",
    });

    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({ ...valid, password: "short" });

    expect(result.success).toBe(false);
  });

  it("rejects blank names", () => {
    const result = registerSchema.safeParse({ ...valid, firstName: "   " });

    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("accepts matching passwords of at least 8 characters", () => {
    const result = resetPasswordSchema.safeParse({
      password: "newpassword1",
      confirmPassword: "newpassword1",
    });

    expect(result.success).toBe(true);
  });

  it("reports mismatched passwords against the confirm field", () => {
    const result = resetPasswordSchema.safeParse({
      password: "newpassword1",
      confirmPassword: "newpassword2",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
    }
  });
});
