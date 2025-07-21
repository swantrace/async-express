// Mock Prisma client for demonstration
// In a real application, this would be your actual Prisma client

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  hashedPassword: string;
  createdAt: Date;
  updatedAt: Date;
}

class MockPrismaClient {
  user = {
    findUnique: async ({
      where,
    }: {
      where: { email: string };
    }): Promise<User | null> => {
      // Mock implementation - in real app, this would query the database
      console.log(`Finding user with email: ${where.email}`);
      return null; // Always return null for this mock
    },

    create: async ({
      data,
    }: {
      data: { email: string; hashedPassword: string; name: string };
    }): Promise<User> => {
      // Mock implementation - in real app, this would create in database
      const user: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: data.email,
        name: data.name,
        role: "user",
        hashedPassword: data.hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      console.log(`Created user:`, user);
      return user;
    },
  };
}

export const prisma = new MockPrismaClient();
