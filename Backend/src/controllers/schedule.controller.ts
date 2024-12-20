import { Request, Response } from "express";
import prisma from "../config/prisma";

// Add a schedule for a specific day (Admin Only)
export const addDaySchedule = async (req: Request, res: Response) => {
  const { courseId, date, topic, description } = req.body;

  try {
    // Check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: Number(courseId) },
    });
    if (!course) {
      res.status(404).json({ error: "Course not found" });
      return;
    }

    // Add the day schedule
    const schedule = await prisma.schedule.create({
      data: {
        courseId: Number(courseId),
        date: new Date(date),
        topic,
        description,
      },
    });

    res
      .status(201)
      .json({ message: "Day schedule added successfully", schedule });
  } catch (error) {
    console.error("Error adding day schedule:", error);
    res.status(500).json({ error: "Failed to add day schedule" });
  }
};

// Get daily schedule (Students & Admin)
export const getDailySchedule = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { date } = req.query; // Expecting a date query parameter

  try {
    const schedules = await prisma.schedule.findMany({
      where: {
        courseId: Number(courseId),
        date: {
          equals: new Date(date as string),
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching daily schedule:", error);
    res.status(500).json({ error: "Failed to fetch daily schedule" });
  }
};

// Get weekly schedule (Students & Admin)
// Get weekly schedule (Students & Admin)
export const getWeeklySchedule = async (req: Request, res: Response) => {
  const { courseId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    // Determine the start and end of the week if not provided
    let start: Date, end: Date;

    if (startDate && endDate) {
      // Use provided startDate and endDate
      start = new Date(startDate as string);
      end = new Date(endDate as string);
    } else {
      // Calculate the current week's start and end dates
      const today = new Date();
      const firstDayOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay() + 1) // Monday
      );
      const lastDayOfWeek = new Date(
        firstDayOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000 // Sunday
      );
      start = firstDayOfWeek;
      end = lastDayOfWeek;
    }

    // Fetch schedules for the specified or calculated week
    const schedules = await prisma.schedule.findMany({
      where: {
        courseId: Number(courseId),
        date: {
          gte: start,
          lte: end,
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    res.json(schedules);
  } catch (error) {
    console.error("Error fetching weekly schedule:", error);
    res.status(500).json({ error: "Failed to fetch weekly schedule" });
  }
};


// Update a specific day's schedule (Admin Only)
export const updateDaySchedule = async (req: Request, res: Response) => {
  const { scheduleId } = req.params;
  const { date, topic, description } = req.body;

  try {
    // Check if the schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(scheduleId) },
    });

    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    // Update the schedule
    const updatedSchedule = await prisma.schedule.update({
      where: { id: Number(scheduleId) },
      data: {
        date: new Date(date),
        topic,
        description,
      },
    });

    res.json({ message: "Schedule updated successfully", updatedSchedule });
  } catch (error) {
    console.error("Error updating day schedule:", error);
    res.status(500).json({ error: "Failed to update schedule" });
  }
};

// Delete a specific day's schedule (Admin Only)
export const deleteDaySchedule = async (req: Request, res: Response) => {
  const { scheduleId } = req.params;

  try {
    // Check if the schedule exists
    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(scheduleId) },
    });

    if (!schedule) {
      res.status(404).json({ error: "Schedule not found" });
      return;
    }

    // Delete the schedule
    await prisma.schedule.delete({
      where: { id: Number(scheduleId) },
    });

    res.json({ message: "Schedule deleted successfully" });
  } catch (error) {
    console.error("Error deleting day schedule:", error);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
};
