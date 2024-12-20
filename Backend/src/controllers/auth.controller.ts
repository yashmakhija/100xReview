import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { AuthRequest } from "../types/auth-request";

const secretKey = process.env.JWT_SECRET || "100xAttend";

// Sign Up
export const signUp = async (req: Request, res: Response) => {
  const { name, email, password, role, number } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        number,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

// Login
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ id: user.id, role: user.role }, secretKey);
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
};

export const macAddr = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const { macAddresses } = req.body;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    for (let macAddress of macAddresses) {
      const existingMac = await prisma.macAddress.findFirst({
        where: {
          address: macAddress,
          userId: userId,
        },
      });

      if (existingMac) {
        res.status(400).json({
          error: `MAC address ${macAddress} already exists for this user`,
        });
        return;
      }

      await prisma.macAddress.create({
        data: {
          address: macAddress,
          userId: userId,
        },
      });
    }

    res.status(200).json({ message: "MAC addresses added successfully!" });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add MAC addresses" });
    return;
  }
};
