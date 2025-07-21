export type LogLevel = "info" | "warn" | "error";

export class Logger {
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
  }

  public info(message: string): void {
    console.info(this.formatMessage("info", message));
  }

  public warn(message: string): void {
    console.warn(this.formatMessage("warn", message));
  }

  public error(message: string): void {
    console.error(this.formatMessage("error", message));
  }
}

export const logger = new Logger();
