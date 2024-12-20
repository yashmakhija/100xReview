import { Request, Response } from "express";
import { UserModel } from "../models";

export const getUserProfile = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await UserModel.getUserById(Number(id));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};
