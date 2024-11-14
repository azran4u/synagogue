export class DateUtil {
  static fromString(str: string): Date {
    return new Date(str);
  }
  static format(date: Date) {
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      month: "long",
      year: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }
}
