import { v4 as uuidv4 } from "uuid";

// Interface for a single prayer time entry
export interface PrayerTimeEntry {
  label: string;
  time?: string; // HH:mm format, optional
}

// Interface for a section of prayer times
export interface PrayerTimeSection {
  id: string;
  title: string;
  times: PrayerTimeEntry[];
}

// Interface for the complete prayer times model
export interface PrayerTimes {
  id: string;
  title: string;
  sections: PrayerTimeSection[];
  createdAt: Date;
  updatedAt: Date;
}

// DTO interfaces for Firestore serialization
export interface PrayerTimeEntryDto {
  label: string;
  time?: string;
}

export interface PrayerTimeSectionDto {
  id: string;
  title: string;
  times: PrayerTimeEntryDto[];
}

export interface PrayerTimesDto {
  id: string;
  title: string;
  sections: PrayerTimeSectionDto[];
  createdAt: number;
  updatedAt: number;
}

// Prayer Time Entry class
export class PrayerTimeEntry {
  public label: string;
  public time?: string;

  constructor(label: string, time?: string) {
    this.label = label;
    this.time = time;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerTimeEntryDto {
    return {
      label: this.label,
      time: this.time,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: PrayerTimeEntryDto): PrayerTimeEntry {
    return new PrayerTimeEntry(dto.label, dto.time);
  }

  // Create a new PrayerTimeEntry
  static create(label: string, time?: string): PrayerTimeEntry {
    return new PrayerTimeEntry(label, time);
  }

  // Check if the time is set
  get hasTime(): boolean {
    return !!this.time;
  }

  // Get formatted time (if available)
  get formattedTime(): string {
    return this.time || "לא נקבע";
  }

  // Update the entry
  update(updates: Partial<PrayerTimeEntry>): PrayerTimeEntry {
    return new PrayerTimeEntry(
      updates.label ?? this.label,
      updates.time ?? this.time
    );
  }

  // Clone the entry
  clone(): PrayerTimeEntry {
    return new PrayerTimeEntry(this.label, this.time);
  }
}

// Prayer Time Section class
export class PrayerTimeSection {
  public id: string;
  public title: string;
  public times: PrayerTimeEntry[];

  constructor(id: string, title: string, times: PrayerTimeEntry[] = []) {
    this.id = id;
    this.title = title;
    this.times = times;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerTimeSectionDto {
    return {
      id: this.id,
      title: this.title,
      times: this.times.map(time => time.toDto()),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: PrayerTimeSectionDto): PrayerTimeSection {
    return new PrayerTimeSection(
      dto.id,
      dto.title,
      dto.times.map(timeDto => PrayerTimeEntry.fromDto(timeDto))
    );
  }

  // Create a new PrayerTimeSection without ID (for creation)
  static create(
    title: string,
    times: PrayerTimeEntry[] = []
  ): PrayerTimeSection {
    return new PrayerTimeSection(uuidv4(), title, times);
  }

  // Add a prayer time entry
  addTimeEntry(entry: PrayerTimeEntry): PrayerTimeSection {
    const updatedTimes = [...this.times, entry];
    return this.update({ times: updatedTimes });
  }

  // Remove a prayer time entry by index
  removeTimeEntry(index: number): PrayerTimeSection {
    const updatedTimes = this.times.filter((_, i) => i !== index);
    return this.update({ times: updatedTimes });
  }

  // Update a prayer time entry
  updateTimeEntry(index: number, entry: PrayerTimeEntry): PrayerTimeSection {
    const updatedTimes = [...this.times];
    updatedTimes[index] = entry;
    return this.update({ times: updatedTimes });
  }

  // Get times that have actual time values
  get timesWithValues(): PrayerTimeEntry[] {
    return this.times.filter(time => time.hasTime);
  }

  // Get times without time values
  get timesWithoutValues(): PrayerTimeEntry[] {
    return this.times.filter(time => !time.hasTime);
  }

  // Check if section has any times with values
  get hasTimesWithValues(): boolean {
    return this.timesWithValues.length > 0;
  }

  // Update the section
  update(
    updates: Partial<Omit<PrayerTimeSection, "id" | "createdAt">>
  ): PrayerTimeSection {
    return new PrayerTimeSection(
      this.id,
      updates.title ?? this.title,
      updates.times ?? this.times
    );
  }

  // Clone the section
  clone(): PrayerTimeSection {
    return new PrayerTimeSection(
      this.id,
      this.title,
      this.times.map(time => time.clone())
    );
  }
}

// Prayer Times class
export class PrayerTimes {
  public id: string;
  public title: string;
  public sections: PrayerTimeSection[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    title: string,
    sections: PrayerTimeSection[] = [],
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.sections = sections;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerTimesDto {
    return {
      id: this.id,
      title: this.title,
      sections: this.sections.map(section => section.toDto()),
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: PrayerTimesDto): PrayerTimes {
    return new PrayerTimes(
      dto.id,
      dto.title,
      dto.sections.map(sectionDto => PrayerTimeSection.fromDto(sectionDto)),
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new PrayerTimes without ID (for creation)
  static create(
    title: string,
    sections: PrayerTimeSection[] = []
  ): PrayerTimes {
    return new PrayerTimes(uuidv4(), title, sections, new Date(), new Date());
  }

  // Add a section
  addSection(section: PrayerTimeSection): PrayerTimes {
    const updatedSections = [...this.sections, section];
    return this.update({ sections: updatedSections });
  }

  // Remove a section by ID
  removeSection(sectionId: string): PrayerTimes {
    const updatedSections = this.sections.filter(
      section => section.id !== sectionId
    );
    return this.update({ sections: updatedSections });
  }

  // Get section by ID
  getSection(sectionId: string): PrayerTimeSection | undefined {
    return this.sections.find(section => section.id === sectionId);
  }

  // Update a section
  updateSection(
    sectionId: string,
    updatedSection: PrayerTimeSection
  ): PrayerTimes {
    const updatedSections = this.sections.map(section =>
      section.id === sectionId ? updatedSection : section
    );
    return this.update({ sections: updatedSections });
  }

  // Get all times from all sections
  getAllTimes(): PrayerTimeEntry[] {
    return this.sections.flatMap(section => section.times);
  }

  // Get all times with actual time values
  getAllTimesWithValues(): PrayerTimeEntry[] {
    return this.sections.flatMap(section => section.timesWithValues);
  }

  // Check if any section has times with values
  get hasAnyTimesWithValues(): boolean {
    return this.sections.some(section => section.hasTimesWithValues);
  }

  // Update the prayer times
  update(updates: Partial<Omit<PrayerTimes, "id" | "createdAt">>): PrayerTimes {
    return new PrayerTimes(
      this.id,
      updates.title ?? this.title,
      updates.sections ?? this.sections,
      this.createdAt,
      new Date()
    );
  }

  // Clone the prayer times
  clone(): PrayerTimes {
    return new PrayerTimes(
      this.id,
      this.title,
      this.sections.map(section => section.clone()),
      this.createdAt,
      this.updatedAt
    );
  }
}
