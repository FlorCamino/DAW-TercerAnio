export class DateUtil {
  static now(): Date {
    return new Date();
  }

  static toISO(date: Date): string {
    return date.toISOString();
  }
}