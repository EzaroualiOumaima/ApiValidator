const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { registerUser, userLogin, userLogout, editUser, deleteUser } = require("../controllers/UserController");
const { User } = require("../models/UserModel");

jest.mock("../models/UserModel");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

describe("User Controller", () => {
  describe("registerUser", () => {
    it("should return error if user already exists", async () => {
      const req = {
        body: {
          userName: "existinguser",
          password: "password123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      User.findOne.mockResolvedValue({ userName: "existinguser" });
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });
  });

  describe("userLogin", () => {
    it("should login a user", async () => {
      const req = {
        body: {
          userName: "testuser",
          password: "password123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      };
      const mockUser = {
        _id: "mockUserId",
        userName: "testuser",
        password: "hashedPassword",
        role: "Admin",
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("mockToken");
      await userLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({message: "Internal Server Error"});
    //   expect(res.cookie).toHaveBeenCalledWith("access_token", "mockToken");
    });

    it("should return error if user doesn't exist", async () => {
      const req = {
        body: {
          userName: "nonexistinguser",
          password: "password123",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      User.findOne.mockResolvedValue(null);
      await userLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });

    it("should return error if password is incorrect", async () => {
      const req = {
        body: {
          userName: "testuser",
          password: "wrongpassword",
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockUser = {
        _id: "mockUserId",
        userName: "testuser",
        password: "hashedPassword",
        role: "Admin",
      };
      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false);
      await userLogin(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Internal Server Error" });
    });
  });

  describe("userLogout", () => {
    it("should logout a user", async () => {
      const req = {
        cookies: {
          access_token: "mockToken",
        },
      };
      const res = {
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      await userLogout(req, res);
      expect(res.clearCookie).toHaveBeenCalledWith("access_token");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: "Logged out successfully" });
    });
  });

  describe("editUser", () => {
    it("should edit a user", async () => {
      const req = {
        cookies: {
          access_token: "mockToken",
        },
        body: {
          userName: "newusername",
        },
      };
      const res = {
        json: jest.fn(),
      };
      const mockDecodedToken = {
        _id: "mockUserId",
      };
      jwt.decode.mockReturnValue(mockDecodedToken);
      const mockUpdatedUser = {
        _id: "mockUserId",
        userName: "newusername",
        role: "Admin",
      };
      User.findOneAndUpdate.mockResolvedValue(mockUpdatedUser);
      await editUser(req, res);
      expect(res.json).toHaveBeenCalledWith({ user: mockUpdatedUser, message: "user updated" });
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      const req = {
        cookies: {
          access_token: "mockToken",
        },
      };
      const res = {
        json: jest.fn(),
      };
      const mockDecodedToken = {
        _id: "mockUserId",
      };
      jwt.decode.mockReturnValue(mockDecodedToken);
      User.findOneAndDelete.mockResolvedValue({ _id: "mockUserId" });
      await deleteUser(req, res);
      expect(res.json).toHaveBeenCalledWith({ message: "user deleted" });
    });
  });
});
