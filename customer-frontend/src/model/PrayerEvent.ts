import { HebrewDate, HebrewDateDto } from "./HebrewDate";

// Prayer Event DTO (matches Firebase schema)
export interface PrayerEventDto {
  type: string;
  hebrewDate: HebrewDateDto;
  notes?: string;
}

export class PrayerEvent {
  public type: string;
  public hebrewDate: HebrewDate;
  public notes?: string;

  constructor(type: string, hebrewDate: HebrewDate, notes?: string) {
    this.type = type;
    this.hebrewDate = hebrewDate;
    this.notes = notes;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerEventDto {
    return {
      type: this.type,
      hebrewDate: this.hebrewDate.toDto(),
      notes: this.notes,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: PrayerEventDto): PrayerEvent {
    return new PrayerEvent(
      dto.type,
      HebrewDate.fromDto(dto.hebrewDate),
      dto.notes
    );
  }

  // Create a new PrayerEvent
  static create(
    type: string,
    hebrewDate: HebrewDate,
    notes?: string
  ): PrayerEvent {
    return new PrayerEvent(type, hebrewDate, notes);
  }

  // Update the prayer event
  update(updates: Partial<PrayerEvent>): PrayerEvent {
    return new PrayerEvent(
      updates.type ?? this.type,
      updates.hebrewDate ?? this.hebrewDate,
      updates.notes ?? this.notes
    );
  }

  // Get formatted date
  get formattedDate(): string {
    return this.hebrewDate.toString();
  }

  // Get event type description
  get typeDescription(): string {
    return this.type;
  }

  // Clone the prayer event
  clone(): PrayerEvent {
    return new PrayerEvent(this.type, this.hebrewDate, this.notes);
  }
}
