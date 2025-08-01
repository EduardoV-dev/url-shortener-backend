import { PRISMA_CODES } from "../prisma-codes";

describe("PRISMA_CODES", () => {
  it("should have RECORD_NOT_FOUND as 'P2025'", () => {
    expect(PRISMA_CODES.RECORD_NOT_FOUND).toBe("P2025");
  });

  it("should be immutable (frozen)", () => {
    expect(Object.isFrozen(PRISMA_CODES)).toBe(true);
    expect(() => {
      // @ts-expect-error Attempting to change a frozen object should throw an error
      PRISMA_CODES.RECORD_NOT_FOUND = "CHANGED";
    }).toThrow(TypeError);
    expect(PRISMA_CODES.RECORD_NOT_FOUND).toBe("P2025");
  });
});
