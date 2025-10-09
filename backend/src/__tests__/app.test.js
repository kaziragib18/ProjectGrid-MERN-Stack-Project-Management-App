import request from "supertest";
import app from "../../index.js";
import mongoose from "mongoose";

describe("GET /", () => {
  it("should return welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty(
      "message",
      "Welcome to the ProjectGrid backend server!"
    );
  });
});

afterAll(async () => {
  await mongoose.disconnect(); // Close DB connection after tests
});
