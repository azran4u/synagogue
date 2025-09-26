import { v4 as uuidv4 } from "uuid";
import { Mapper } from "../services/genericService";

// Interface for a single prayer time entry
export interface PrayerTimeEntry {
  title: string;
  hour: string;
  displayOrder: number;
  enabled: boolean;
  notes?: string;
}

// Interface for the complete prayer times model
export interface PrayerTimes {
  id: string;
  title: string;
  displayOrder: number;
  enabled: boolean;
  notes?: string;
  times: PrayerTimeEntry[];
  createdAt: Date;
  updatedAt: Date;
}

// DTO interfaces for Firestore serialization
export interface PrayerTimeEntryDto {
  title: string;
  hour: string;
  displayOrder: number;
  enabled: boolean;
  notes?: string;
}

export interface PrayerTimesDto {
  id: string;
  title: string;
  displayOrder: number;
  enabled: boolean;
  notes?: string;
  times: PrayerTimeEntryDto[];
  createdAt: number;
  updatedAt: number;
}

// Prayer Time Entry class
export class PrayerTimeEntry {
  public title: string;
  public hour: string;
  public displayOrder: number;
  public enabled: boolean;
  public notes?: string;

  constructor(
    title: string,
    hour: string,
    displayOrder: number = 1,
    enabled: boolean = true,
    notes?: string
  ) {
    this.title = title;
    this.hour = hour;
    this.displayOrder = displayOrder;
    this.enabled = enabled;
    this.notes = notes;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerTimeEntryDto {
    return {
      title: this.title,
      hour: this.hour,
      displayOrder: this.displayOrder,
      enabled: this.enabled,
      notes: this.notes,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: PrayerTimeEntryDto): PrayerTimeEntry {
    return new PrayerTimeEntry(
      dto.title,
      dto.hour,
      dto.displayOrder,
      dto.enabled,
      dto.notes
    );
  }

  // Create a new PrayerTimeEntry
  static create(
    title: string,
    hour: string,
    displayOrder: number = 1,
    notes?: string
  ): PrayerTimeEntry {
    return new PrayerTimeEntry(title, hour, displayOrder, true, notes);
  }

  // Enable the entry
  enable(): PrayerTimeEntry {
    return this.update({ enabled: true });
  }

  // Disable the entry
  disable(): PrayerTimeEntry {
    return this.update({ enabled: false });
  }

  // Check if the entry is enabled
  get isEnabled(): boolean {
    return this.enabled;
  }

  // Check if the entry has notes
  get hasNotes(): boolean {
    return !!(this.notes && this.notes.trim().length > 0);
  }

  // Get formatted time
  get formattedTime(): string {
    return this.hour || "לא נקבע";
  }

  // Update the entry
  update(updates: Partial<PrayerTimeEntry>): PrayerTimeEntry {
    return new PrayerTimeEntry(
      updates.title ?? this.title,
      updates.hour ?? this.hour,
      updates.displayOrder ?? this.displayOrder,
      updates.enabled ?? this.enabled,
      updates.notes ?? this.notes
    );
  }

  // Clone the entry
  clone(): PrayerTimeEntry {
    return new PrayerTimeEntry(
      this.title,
      this.hour,
      this.displayOrder,
      this.enabled,
      this.notes
    );
  }
}

// Prayer Times class
export class PrayerTimes {
  public id: string;
  public title: string;
  public displayOrder: number;
  public enabled: boolean;
  public notes?: string;
  public times: PrayerTimeEntry[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    title: string,
    displayOrder: number = 1,
    enabled: boolean = true,
    notes?: string,
    times: PrayerTimeEntry[] = [],
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.displayOrder = displayOrder;
    this.enabled = enabled;
    this.notes = notes;
    this.times = times;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerTimesDto {
    return {
      id: this.id,
      title: this.title,
      displayOrder: this.displayOrder,
      enabled: this.enabled,
      notes: this.notes,
      times: this.times.map(time => time.toDto()),
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: PrayerTimesDto): PrayerTimes {
    return new PrayerTimes(
      dto.id,
      dto.title,
      dto.displayOrder,
      dto.enabled,
      dto.notes,
      dto.times.map(timeDto => PrayerTimeEntry.fromDto(timeDto)),
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new PrayerTimes without ID (for creation)
  static create(
    title: string,
    displayOrder: number = 1,
    notes?: string,
    times: PrayerTimeEntry[] = []
  ): PrayerTimes {
    return new PrayerTimes(
      uuidv4(),
      title,
      displayOrder,
      true, // enabled by default
      notes,
      times,
      new Date(),
      new Date()
    );
  }

  // Add a prayer time entry
  addTimeEntry(entry: PrayerTimeEntry): PrayerTimes {
    const updatedTimes = [...this.times, entry];
    return this.update({ times: updatedTimes });
  }

  // Remove a prayer time entry by index
  removeTimeEntry(index: number): PrayerTimes {
    const updatedTimes = this.times.filter((_, i) => i !== index);
    return this.update({ times: updatedTimes });
  }

  // Update a prayer time entry
  updateTimeEntry(index: number, entry: PrayerTimeEntry): PrayerTimes {
    const updatedTimes = [...this.times];
    updatedTimes[index] = entry;
    return this.update({ times: updatedTimes });
  }

  // Enable the prayer times
  enable(): PrayerTimes {
    return this.update({ enabled: true });
  }

  // Disable the prayer times
  disable(): PrayerTimes {
    return this.update({ enabled: false });
  }

  // Get enabled times only
  get enabledTimes(): PrayerTimeEntry[] {
    return this.times.filter(time => time.enabled);
  }

  // Get disabled times only
  get disabledTimes(): PrayerTimeEntry[] {
    return this.times.filter(time => !time.enabled);
  }

  // Check if prayer times has any enabled times
  get hasEnabledTimes(): boolean {
    return this.enabledTimes.length > 0;
  }

  // Check if prayer times is enabled
  get isEnabled(): boolean {
    return this.enabled;
  }

  // Check if prayer times has notes
  get hasNotes(): boolean {
    return !!(this.notes && this.notes.trim().length > 0);
  }

  // Update the prayer times
  update(updates: Partial<Omit<PrayerTimes, "id" | "createdAt">>): PrayerTimes {
    return new PrayerTimes(
      this.id,
      updates.title ?? this.title,
      updates.displayOrder ?? this.displayOrder,
      updates.enabled ?? this.enabled,
      updates.notes ?? this.notes,
      updates.times ?? this.times,
      this.createdAt,
      new Date()
    );
  }

  // Clone the prayer times
  clone(): PrayerTimes {
    return new PrayerTimes(
      this.id,
      this.title,
      this.displayOrder,
      this.enabled,
      this.notes,
      this.times.map(time => time.clone()),
      this.createdAt,
      this.updatedAt
    );
  }
}

export const prayerTimesMapper: Mapper<PrayerTimes, PrayerTimesDto> = {
  fromDto: PrayerTimes.fromDto,
  toDto: (entity: PrayerTimes) => entity.toDto(),
};
