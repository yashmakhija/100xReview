import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { createError, ErrorType } from "../errors";

const prisma = new PrismaClient();

/**
 * Create admin and regular user accounts
 * Usage:
 *   npx ts-node src/scripts/createUsers.ts admin@example.com adminPassword
 *   npx ts-node src/scripts/createUsers.ts user@example.com userPassword USER
 *   npx ts-node src/scripts/createUsers.ts user@example.com userPassword USER 1 (with course ID)
 */
async function createUser(
  email: string,
  password: string,
  role: "ADMIN" | "USER" = "ADMIN",
  courseId?: number,
  name: string = role === "ADMIN" ? "Admin User" : "Regular User"
) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      console.log(`User with email ${email} already exists`);
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role,
          isOnboarded: true,
        },
      });

      let enrollment = null;
      if (courseId) {
        const course = await tx.course.findUnique({
          where: { id: courseId },
          select: { id: true, name: true },
        });

        if (course) {
          enrollment = await tx.enrollment.create({
            data: {
              userId: user.id,
              courseId: course.id,
            },
            include: {
              course: {
                select: { name: true },
              },
            },
          });
          console.log(`Enrolled in course: ${course.name}`);
        } else {
          console.log(`Course with ID ${courseId} not found`);
        }
      }

      return { user, enrollment };
    });

    const user = result.user;

    console.log(`${role} user created successfully:`);
    console.log(`- Email: ${user.email}`);
    console.log(`- Name: ${user.name}`);
    console.log(`- ID: ${user.id}`);
    if (result.enrollment) {
      console.log(`- Enrolled in course: ${result.enrollment.course.name}`);
    }
  } catch (error) {
    console.error("Failed to create user:", error);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log(
      "Usage: npx ts-node src/scripts/createUsers.ts <email> <password> [ADMIN|USER] [courseId]"
    );
    process.exit(1);
  }

  const email = args[0];
  const password = args[1];
  const role = (args[2] === "USER" ? "USER" : "ADMIN") as "ADMIN" | "USER";
  const courseId = args[3] ? parseInt(args[3]) : undefined;

  await createUser(email, password, role, courseId);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
