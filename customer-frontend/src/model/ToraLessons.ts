import { v4 as uuidv4 } from "uuid";
import { Mapper } from "../services/genericService";

// Interface for a single Torah lesson
export interface ToraLesson {
  id: string;
  title: string;
  ledBy: string;
  hour: string;
  hebrewDate: string;
  recurrenceType: "none" | "weekly" | "monthly";
  displayOrder: number;
  enabled: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// DTO interfaces for Firestore serialization
export interface ToraLessonDto {
  id: string;
  title: string;
  ledBy: string;
  hour: string;
  hebrewDate: string;
  recurrenceType: "none" | "weekly" | "monthly";
  displayOrder: number;
  enabled: boolean;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

// Torah Lesson class
export class ToraLesson {
  public id: string;
  public title: string;
  public ledBy: string;
  public hour: string;
  public hebrewDate: string;
  public recurrenceType: "none" | "weekly" | "monthly";
  public displayOrder: number;
  public enabled: boolean;
  public notes?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    title: string,
    ledBy: string,
    hour: string,
    hebrewDate: string,
    recurrenceType: "none" | "weekly" | "monthly" = "none",
    displayOrder: number = 1,
    enabled: boolean = true,
    notes?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.ledBy = ledBy;
    this.hour = hour;
    this.hebrewDate = hebrewDate;
    this.recurrenceType = recurrenceType;
    this.displayOrder = displayOrder;
    this.enabled = enabled;
    this.notes = notes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): ToraLessonDto {
    return {
      id: this.id,
      title: this.title,
      ledBy: this.ledBy,
      hour: this.hour,
      hebrewDate: this.hebrewDate,
      recurrenceType: this.recurrenceType,
      displayOrder: this.displayOrder,
      enabled: this.enabled,
      notes: this.notes,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: ToraLessonDto): ToraLesson {
    return new ToraLesson(
      dto.id,
      dto.title,
      dto.ledBy,
      dto.hour,
      dto.hebrewDate,
      dto.recurrenceType,
      dto.displayOrder,
      dto.enabled,
      dto.notes,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new Torah lesson
  static create(
    title: string,
    ledBy: string,
    hour: string,
    hebrewDate: string,
    recurrenceType: "none" | "weekly" | "monthly" = "none",
    displayOrder: number = 1,
    notes?: string
  ): ToraLesson {
    return new ToraLesson(
      uuidv4(),
      title,
      ledBy,
      hour,
      hebrewDate,
      recurrenceType,
      displayOrder,
      true, // enabled by default
      notes
    );
  }

  // Enable the lesson
  enable(): ToraLesson {
    return this.update({ enabled: true });
  }

  // Disable the lesson
  disable(): ToraLesson {
    return this.update({ enabled: false });
  }

  // Check if lesson has notes
  get hasNotes(): boolean {
    return !!(this.notes && this.notes.trim().length > 0);
  }

  // Check if lesson is enabled
  get isEnabled(): boolean {
    return this.enabled;
  }

  // Get formatted time
  get formattedTime(): string {
    return this.hour || "לא נקבע";
  }

  // Get recurrence type description (Hebrew)
  get recurrenceTypeDescription(): string {
    switch (this.recurrenceType) {
      case "none":
        return "חד פעמי";
      case "weekly":
        return "שבועי";
      case "monthly":
        return "חודשי";
      default:
        return "לא ידוע";
    }
  }

  // Check if lesson is recurring
  get isRecurring(): boolean {
    return this.recurrenceType !== "none";
  }

  // Check if lesson is one-time
  get isOneTime(): boolean {
    return this.recurrenceType === "none";
  }

  // Update the lesson
  update(updates: Partial<Omit<ToraLesson, "id" | "createdAt">>): ToraLesson {
    return new ToraLesson(
      this.id,
      updates.title ?? this.title,
      updates.ledBy ?? this.ledBy,
      updates.hour ?? this.hour,
      updates.hebrewDate ?? this.hebrewDate,
      updates.recurrenceType ?? this.recurrenceType,
      updates.displayOrder ?? this.displayOrder,
      updates.enabled ?? this.enabled,
      updates.notes ?? this.notes,
      this.createdAt,
      new Date()
    );
  }

  // Clone the lesson
  clone(): ToraLesson {
    return new ToraLesson(
      this.id,
      this.title,
      this.ledBy,
      this.hour,
      this.hebrewDate,
      this.recurrenceType,
      this.displayOrder,
      this.enabled,
      this.notes,
      this.createdAt,
      this.updatedAt
    );
  }
}

// Collection of Torah lessons
export interface ToraLessonsCollection {
  id: string;
  title: string;
  displayOrder: number;
  enabled: boolean;
  notes?: string;
  lessons: ToraLesson[];
  createdAt: Date;
  updatedAt: Date;
}

// DTO for collection
export interface ToraLessonsCollectionDto {
  id: string;
  title: string;
  displayOrder: number;
  enabled: boolean;
  notes?: string;
  lessons: ToraLessonDto[];
  createdAt: number;
  updatedAt: number;
}

// Collection class
export class ToraLessonsCollection {
  public id: string;
  public title: string;
  public displayOrder: number;
  public enabled: boolean;
  public notes?: string;
  public lessons: ToraLesson[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    title: string,
    displayOrder: number = 1,
    enabled: boolean = true,
    notes?: string,
    lessons: ToraLesson[] = [],
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.displayOrder = displayOrder;
    this.enabled = enabled;
    this.notes = notes;
    this.lessons = lessons;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO
  toDto(): ToraLessonsCollectionDto {
    return {
      id: this.id,
      title: this.title,
      displayOrder: this.displayOrder,
      enabled: this.enabled,
      notes: this.notes,
      lessons: this.lessons.map(lesson => lesson.toDto()),
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  // Create from DTO
  static fromDto(dto: ToraLessonsCollectionDto): ToraLessonsCollection {
    return new ToraLessonsCollection(
      dto.id,
      dto.title,
      dto.displayOrder,
      dto.enabled,
      dto.notes,
      dto.lessons.map(lessonDto => ToraLesson.fromDto(lessonDto)),
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new collection
  static create(
    title: string,
    displayOrder: number = 1,
    notes?: string
  ): ToraLessonsCollection {
    return new ToraLessonsCollection(
      uuidv4(),
      title,
      displayOrder,
      true, // enabled by default
      notes,
      []
    );
  }

  // Add a lesson
  addLesson(lesson: ToraLesson): ToraLessonsCollection {
    const updatedLessons = [...this.lessons, lesson];
    return this.update({ lessons: updatedLessons });
  }

  // Remove a lesson
  removeLesson(lessonId: string): ToraLessonsCollection {
    const updatedLessons = this.lessons.filter(
      lesson => lesson.id !== lessonId
    );
    return this.update({ lessons: updatedLessons });
  }

  // Get lesson by ID
  getLesson(lessonId: string): ToraLesson | undefined {
    return this.lessons.find(lesson => lesson.id === lessonId);
  }

  // Enable the collection
  enable(): ToraLessonsCollection {
    return this.update({ enabled: true });
  }

  // Disable the collection
  disable(): ToraLessonsCollection {
    return this.update({ enabled: false });
  }

  // Get enabled lessons only
  get enabledLessons(): ToraLesson[] {
    return this.lessons.filter(lesson => lesson.enabled);
  }

  // Get disabled lessons only
  get disabledLessons(): ToraLesson[] {
    return this.lessons.filter(lesson => !lesson.enabled);
  }

  // Get recurring lessons
  get recurringLessons(): ToraLesson[] {
    return this.lessons.filter(lesson => lesson.isRecurring);
  }

  // Get one-time lessons
  get oneTimeLessons(): ToraLesson[] {
    return this.lessons.filter(lesson => lesson.isOneTime);
  }

  // Get lessons with notes
  get lessonsWithNotes(): ToraLesson[] {
    return this.lessons.filter(lesson => lesson.hasNotes);
  }

  // Check if collection is enabled
  get isEnabled(): boolean {
    return this.enabled;
  }

  // Check if collection has notes
  get hasNotes(): boolean {
    return !!(this.notes && this.notes.trim().length > 0);
  }

  // Check if collection has any enabled lessons
  get hasEnabledLessons(): boolean {
    return this.enabledLessons.length > 0;
  }

  // Update the collection
  update(
    updates: Partial<Omit<ToraLessonsCollection, "id" | "createdAt">>
  ): ToraLessonsCollection {
    return new ToraLessonsCollection(
      this.id,
      updates.title ?? this.title,
      updates.displayOrder ?? this.displayOrder,
      updates.enabled ?? this.enabled,
      updates.notes ?? this.notes,
      updates.lessons ?? this.lessons,
      this.createdAt,
      new Date()
    );
  }

  // Clone the collection
  clone(): ToraLessonsCollection {
    return new ToraLessonsCollection(
      this.id,
      this.title,
      this.displayOrder,
      this.enabled,
      this.notes,
      this.lessons.map(lesson => lesson.clone()),
      this.createdAt,
      this.updatedAt
    );
  }
}

export const toraLessonsMapper: Mapper<
  ToraLessonsCollection,
  ToraLessonsCollectionDto
> = {
  fromDto: ToraLessonsCollection.fromDto,
  toDto: (entity: ToraLessonsCollection) => entity.toDto(),
};
