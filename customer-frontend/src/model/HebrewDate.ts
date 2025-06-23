import { HDate } from "@hebcal/core";

export interface HebrewDateDto {
  year: number;
  month: number;
  day: number;
}

export class HebrewDate {
  private _hDate: HDate;

  constructor(year: number, month: number, day: number);
  constructor(date: Date);
  constructor(hDate: HDate);
  constructor(yearOrDate: number | Date | HDate, month?: number, day?: number) {
    if (yearOrDate instanceof HDate) {
      this._hDate = yearOrDate;
    } else if (yearOrDate instanceof Date) {
      this._hDate = new HDate(yearOrDate);
    } else if (
      typeof yearOrDate === "number" &&
      month !== undefined &&
      day !== undefined
    ) {
      this._hDate = new HDate(day, month, yearOrDate);
    } else {
      throw new Error("Invalid constructor arguments for HebrewDate");
    }
  }

  // Getters for year, month, day
  get year(): number {
    return this._hDate.getFullYear();
  }

  get month(): number {
    return this._hDate.getMonth();
  }

  get day(): number {
    return this._hDate.getDate();
  }

  // Get the underlying HDate object (readonly)
  get hDate(): HDate {
    return this._hDate;
  }

  // Convert to Gregorian Date
  toGregorianDate(): Date {
    return this._hDate.greg();
  }

  // Create from Gregorian Date
  static fromGregorianDate(date: Date): HebrewDate {
    return new HebrewDate(new HDate(date));
  }

  // Create from Hebrew date components
  static fromHebrewDate(year: number, month: number, day: number): HebrewDate {
    return new HebrewDate(year, month, day);
  }

  // Get current Hebrew date
  static now(): HebrewDate {
    return new HebrewDate(new Date());
  }

  // Clone the HebrewDate
  clone(): HebrewDate {
    return new HebrewDate(this._hDate);
  }

  // Check if this date equals another HebrewDate
  equals(other: HebrewDate): boolean {
    return (
      this.year === other.year &&
      this.month === other.month &&
      this.day === other.day
    );
  }

  // Add days to the date
  addDays(days: number): HebrewDate {
    const newHDate = new HDate(this._hDate);
    for (let i = 0; i < days; i++) {
      newHDate.next();
    }
    return new HebrewDate(newHDate);
  }

  // Subtract days from the date
  subtractDays(days: number): HebrewDate {
    return this.addDays(-days);
  }

  // Check if the date is valid
  isValid(): boolean {
    try {
      // Try to create a new HDate to validate
      new HDate(this.day, this.month, this.year);
      return true;
    } catch {
      return false;
    }
  }

  // Convert to plain object (for backward compatibility)
  toDto(): HebrewDateDto {
    return {
      year: this.year,
      month: this.month,
      day: this.day,
    };
  }

  // Create from plain object (for backward compatibility)
  static fromDto(obj: HebrewDateDto): HebrewDate {
    if (
      !obj ||
      obj.year === undefined ||
      obj.month === undefined ||
      obj.day === undefined
    ) {
      throw new Error("Invalid HebrewDateDto " + JSON.stringify(obj));
    }
    return new HebrewDate(obj.year, obj.month, obj.day);
  }
}
