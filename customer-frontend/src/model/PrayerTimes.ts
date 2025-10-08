import { v4 as uuidv4 } from "uuid";
import { Mapper } from "../services/genericService";

export interface PrayerTimeEntry {
  title: string;
  hour?: string;
  displayOrder: number;
  enabled: boolean;
  notes?: string;
}

export interface PrayerTimeSectionEntry {
  title: string;
  displayOrder: number;
  enabled: boolean;
  notes?: string;
  times: PrayerTimeEntry[];
}

// DTO interface for Firestore serialization
export interface PrayerTimesDto {
  id: string;
  title: string;
  displayOrder: number;
  enabled: boolean;
  notes?: string;
  sections: PrayerTimeSectionEntry[];
  createdAt: number;
  updatedAt: number;
}

export class PrayerTimes {
  public id: string;
  public title: string;
  public displayOrder: number;
  public enabled: boolean;
  public notes?: string;
  public sections: PrayerTimeSectionEntry[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    title: string,
    displayOrder: number = 0,
    enabled: boolean = true,
    notes?: string,
    sections: PrayerTimeSectionEntry[] = [],
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.displayOrder = displayOrder;
    this.enabled = enabled;
    this.notes = notes;
    this.sections = sections;
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
      sections: this.sections,
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
      dto.sections || [],
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new PrayerTimes
  static create(
    title: string,
    displayOrder?: number,
    notes?: string,
    sections?: PrayerTimeSectionEntry[]
  ): PrayerTimes {
    return new PrayerTimes(
      uuidv4(),
      title,
      displayOrder ?? 0,
      true,
      notes,
      sections ?? [],
      new Date(),
      new Date()
    );
  }

  // Update the prayer times
  update(updates: Partial<Omit<PrayerTimes, "id" | "createdAt">>): PrayerTimes {
    return new PrayerTimes(
      this.id,
      updates.title ?? this.title,
      updates.displayOrder ?? this.displayOrder,
      updates.enabled ?? this.enabled,
      updates.notes ?? this.notes,
      updates.sections ?? this.sections,
      this.createdAt,
      new Date() // updatedAt
    );
  }

  // Enable the prayer times
  enable(): PrayerTimes {
    return this.update({ enabled: true });
  }

  // Disable the prayer times
  disable(): PrayerTimes {
    return this.update({ enabled: false });
  }

  // Add a section
  addSection(section: PrayerTimeSectionEntry): PrayerTimes {
    const updatedSections = [...this.sections, section].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );
    return this.update({ sections: updatedSections });
  }

  // Remove a section by index
  removeSection(index: number): PrayerTimes {
    const updatedSections = this.sections.filter((_, i) => i !== index);
    return this.update({ sections: updatedSections });
  }

  // Update a section by index
  updateSection(
    index: number,
    sectionUpdates: Partial<PrayerTimeSectionEntry>
  ): PrayerTimes {
    const updatedSections = this.sections.map((section, i) =>
      i === index ? { ...section, ...sectionUpdates } : section
    );
    return this.update({ sections: updatedSections });
  }

  // Get all enabled sections
  get enabledSections(): PrayerTimeSectionEntry[] {
    return this.sections.filter(section => section.enabled);
  }

  // Check if prayer times is enabled
  get isEnabled(): boolean {
    return this.enabled;
  }

  // Check if prayer times has notes
  get hasNotes(): boolean {
    return !!(this.notes && this.notes.trim().length > 0);
  }

  // Clone the prayer times
  clone(): PrayerTimes {
    return new PrayerTimes(
      this.id,
      this.title,
      this.displayOrder,
      this.enabled,
      this.notes,
      [...this.sections],
      new Date(this.createdAt),
      new Date(this.updatedAt)
    );
  }
}

export const prayerTimesMapper: Mapper<PrayerTimes, PrayerTimesDto> = {
  fromDto: PrayerTimes.fromDto,
  toDto: (entity: PrayerTimes) => entity.toDto(),
};
