export type LogLevel = "info" | "warn" | "error";

export class Logger {
  private formatMessage(level: LogLevel): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]:`;
  }

  public info(...args: unknown[]): void {
    console.info(this.formatMessage("info"), ...args);
  }

  public warn(...args: unknown[]): void {
    console.warn(this.formatMessage("warn"), ...args);
  }

  public error(...args: unknown[]): void {
    console.error(this.formatMessage("error"), ...args);
  }
}

export const logger = new Logger();
