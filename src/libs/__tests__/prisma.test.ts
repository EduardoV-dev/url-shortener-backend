beforeEach(() => {
  jest.resetModules();
  jest.doMock("@/generated/prisma/client", () => {
    return {
      PrismaClient: function () {
        return {
          $connect: jest.fn(),
          $disconnect: jest.fn(),
        };
      },
    };
  });
});

it("should export an object with $connect and $disconnect", async () => {
  const { prisma } = await import("../prisma");
  expect(prisma).toBeDefined();
  expect(typeof prisma.$connect).toBe("function");
  expect(typeof prisma.$disconnect).toBe("function");
});
