import { Request, Response } from "express";
import { AttendanceModel } from "../models";

export const markAttendance = async (req: Request, res: Response) => {
  const { userId, scheduleId, timeWorked } = req.body;

  try {
    const attendance = await AttendanceModel.markAttendance({
      userId,
      scheduleId,
      timeWorked,
    });
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: "Failed to mark attendance" });
  }
};

export const getUserAttendance = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const attendance = await AttendanceModel.getAttendanceByUser(
      Number(userId)
    );
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch attendance" });
  }
};
