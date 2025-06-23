import { gematriya, HDate } from "@hebcal/core";
import { HebrewDate } from "../model/HebrewDate";

export class DatesUtil {
  static hebrewDateToDate(hd: HebrewDate): Date {
    return hd.toGregorianDate();
  }

  static dateToHebrewDate(date: Date): HebrewDate {
    return HebrewDate.fromGregorianDate(date);
  }

  static readonly HEBREW_MONTHS: { [key: number]: string } = {
    1: "ניסן",
    2: "אייר",
    3: "סיון",
    4: "תמוז",
    5: "אב",
    6: "אלול",
    7: "תשרי",
    8: "חשון",
    9: "כסלו",
    10: "טבת",
    11: "שבט",
    12: "אדר א׳",
    13: "אדר ב׳",
  };

  static readonly HEBREW_DAYS: { [key: number]: string } = {
    1: "א׳",
    2: "ב׳",
    3: "ג׳",
    4: "ד׳",
    5: "ה׳",
    6: "ו׳",
    7: "ז׳",
    8: "ח׳",
    9: "ט׳",
    10: "י׳",
    11: "י״א",
    12: "י״ב",
    13: "י״ג",
    14: "י״ד",
    15: "ט״ו",
    16: "ט״ז",
    17: "י״ז",
    18: "י״ח",
    19: "י״ט",
    20: "כ׳",
    21: "כ״א",
    22: "כ״ב",
    23: "כ״ג",
    24: "כ״ד",
    25: "כ״ה",
    26: "כ״ו",
    27: "כ״ז",
    28: "כ״ח",
    29: "כ״ט",
    30: "ל׳",
  };

  static readonly CURRENT_HEBREW_YEAR = new HDate(new Date()).getFullYear();

  static readonly HEBREW_YEARS: { [key: number]: string } = Object.fromEntries(
    Array.from({ length: 200 }, (_, i) => {
      const year = DatesUtil.CURRENT_HEBREW_YEAR + 100 - i;
      return [year, gematriya(year)];
    })
  );

  static hebrewDateToString(hd: HebrewDate): string {
    return `${DatesUtil.HEBREW_DAYS[hd.day]} ${DatesUtil.HEBREW_MONTHS[hd.month]} ${DatesUtil.HEBREW_YEARS[hd.year]}`;
  }

  static dateToString(date: Date): string {
    return (
      date.getDate() + "/" + (date.getMonth() + 1) + "/" + date.getFullYear()
    );
  }
}
