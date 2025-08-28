export interface CodeGenerator {
  /**
   * Generates a short code of random length between min and max.
   * @param min - Minimum length of the generated code.
   * @param max - Maximum length of the generated code.
   * @returns A promise that resolves to the generated short code.
   * @throws Error if min is greater than max.
   */
  generateByRange: (min: number, max: number) => Promise<string>;
}

export const MIN_CODE_LENGTH = 6;
export const MAX_CODE_LENGTH = 10;

/**
 * Implementation of the CodeGenerator interface that generates short codes using the nanoid library.
 * The generated codes are of random length between the specified minimum and maximum values.
 */
export class ShortCodeGenerator implements CodeGenerator {
  /**
   * Generates a random integer between min and max (inclusive).
   * @param min - Minimum value for the random integer.
   * @param max - Maximum value for the random integer.
   * @returns A random integer between min and max.
   * @throws Error if min is greater than max.
   */
  private generateIntByRange = (min: number, max: number) => {
    if (min > max) throw new Error("Minimum value cannot be greater than maximum value.");
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  public generateByRange: CodeGenerator["generateByRange"] = async (min, max) => {
    const { nanoid } = await import("nanoid");
    const codeLength = this.generateIntByRange(min, max);
    const shortCode = nanoid(codeLength);
    return shortCode;
  };
}
