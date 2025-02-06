import request from "supertest";
import { app } from "..";
import { prisma } from "../utils/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/emails";

jest.mock("../utils/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
  verify: jest.fn(),
}));

jest.mock("../utils/emails", () => ({
  sendEmail: jest.fn(),
}));

const mockUser = {
  id: "user123",
  email: "test@example.com",
  password: "hashedpassword",
  company_id: "company123",
};

describe("Authentication and Authorization Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // 1️⃣ Test User Registration
  it("should register a new user", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.user.create as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedpassword");
    (sendEmail as jest.Mock).mockResolvedValue(true);

    const res = await request(app).post("/api/v1/register").send({
      name: "John Doe",
      email: "test@example.com",
      company_id: "company123",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
    expect(prisma.user.create).toHaveBeenCalled();
    expect(sendEmail).toHaveBeenCalled();
  });

  // 2️⃣ Test Registration Failure (Duplicate Email)
  it("should not register user if email already exists", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app).post("/api/auth/register").send({
      name: "John Doe",
      email: "test@example.com",
      company_id: "company123",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email already exist");
  });

  // 3️⃣ Test User Login
  it("should login the user with correct credentials", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue("mockedToken");

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.token).toBe("mockedToken");
  });

  // 4️⃣ Test Login Failure (Wrong Password)
  it("should fail login if password is incorrect", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid credentials");
  });

  // 5️⃣ Test Forgot Password (Send User Details)
  it("should reset the password and send email", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.hash as jest.Mock).mockResolvedValue("newhashedpassword");
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);
    (sendEmail as jest.Mock).mockResolvedValue(true);

    const res = await request(app).post("/api/auth/reset-password").send({
      email: "test@example.com",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("New password sent successfully");
    expect(sendEmail).toHaveBeenCalled();
  });

  // 6️⃣ Test Password Update
  it("should update user password", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (bcrypt.hash as jest.Mock).mockResolvedValue("newhashedpassword");
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app).put("/api/auth/update-password").send({
      email: "test@example.com",
      newPassword: "newpassword123",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password updated successfully");
  });

  // 7️⃣ Test Resend Password Reset Link
  it("should send a password reset link", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
    (jwt.sign as jest.Mock).mockReturnValue("resetToken");
    (sendEmail as jest.Mock).mockResolvedValue(true);

    const res = await request(app).post("/api/auth/resend-reset-link").send({
      email: "test@example.com",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password reset link sent successfully");
  });

  // 8️⃣ Test Reset Password from Link
  it("should update password using token", async () => {
    (jwt.verify as jest.Mock).mockReturnValue({ userId: "user123" });
    (bcrypt.hash as jest.Mock).mockResolvedValue("hashedNewPassword");
    (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app).post("/api/auth/update-password-link").send({
      token: "validToken",
      newPassword: "newpassword123",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password updated successfully");
  });

  // 9️⃣ Test Reset Password with Invalid Token
  it("should fail password update if token is invalid", async () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid token");
    });

    const res = await request(app).post("/api/auth/update-password-link").send({
      token: "invalidToken",
      newPassword: "newpassword123",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Invalid token");
  });
});
