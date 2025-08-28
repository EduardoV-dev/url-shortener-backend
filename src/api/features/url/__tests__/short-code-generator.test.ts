import { ShortCodeGenerator } from "../short-code-generator";

// Mock nanoid
jest.mock("nanoid", () => ({
  nanoid: (length: number) => "x".repeat(length),
}));

describe("ShortCodeGenerator", () => {
  const generator = new ShortCodeGenerator();

  it("should generate a code with length within the given range", async () => {
    const min = 5;
    const max = 10;
    const code = await generator.generateByRange(min, max);
    expect(code.length).toBeGreaterThanOrEqual(min);
    expect(code.length).toBeLessThanOrEqual(max);
    expect(typeof code).toBe("string");
  });

  it("should generate a code with length equal to min when min == max", async () => {
    const min = 8;
    const max = 8;
    const code = await generator.generateByRange(min, max);
    expect(code.length).toBe(8);
  });

  it("should throw or handle when min > max", async () => {
    const min = 10;
    const max = 5;
    await expect(generator.generateByRange(min, max)).rejects.toThrow(Error);
  });
});
