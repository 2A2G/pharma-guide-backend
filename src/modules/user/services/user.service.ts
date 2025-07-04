import { PrismaClient, User } from "@prisma/client";
import { bcryptService } from "../../../utils/bcryp/bcryp.service";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

export class UserService {
  async getUser(): Promise<User[]> {
    try {
      return await prisma.user.findMany({
        include: { role: true },
      });
    } catch (error: any) {
      console.error("Error fetching users:", error.message);
      throw new Error("An error occurred while fetching users.");
    }
  }

  async getUserById(idUser: number): Promise<User | null> {
    try {
      return await prisma.user.findFirst({
        where: { id: idUser, isDeleted: false },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      throw new Error("An error occurred while fetching the user.");
    }
  }

  async updateUser(userId: number, user: User): Promise<User | null> {
    try {
      const existingUser = await prisma.user.findFirst({
        where: { id: userId, isDeleted: false },
      });

      if (!existingUser) {
        throw new Error("User not found or already deleted.");
      }

      const emailExists = await prisma.user.findFirst({
        where: {
          email: user.email,
          id: { not: userId },
        },
      });

      if (emailExists) {
        throw new Error("El email ya está en uso por otro usuario.");
      }

      if (user.password) {
        user.password = await bcryptService.encryptPassword(user.password);
      }

      if (typeof user.birth_date === "string") {
        user.birth_date = new Date(user.birth_date);
      }

      const updatedUser = await prisma.user.update({
        where: { id: existingUser.id },
        data: user,
      });

      return updatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("An error occurred while updating the user.");
    }
  }

  async deleteUser(idUser: number): Promise<User | null> {
    try {
      const userData = await prisma.user.findFirst({
        where: { id: idUser, isDeleted: false },
      });

      if (!userData) {
        throw new Error("User not found or already deleted.");
      }

      const updatedUser = await prisma.user.update({
        where: { id: userData.id },
        data: { isDeleted: true },
      });

      return updatedUser;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw new Error("An error occurred while deleting the user.");
    }
  }
}
