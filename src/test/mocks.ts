/* eslint-disable @typescript-eslint/no-explicit-any */

export const MOCK_RESPONSE_EXPRESS: any = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};

export type MockInterface<T> = {
  [K in keyof T as T[K] extends (...args: any[]) => any ? K : never]: T[K] extends (
    ...args: any[]
  ) => any
    ? jest.MockedFunction<T[K]>
    : never;
};
