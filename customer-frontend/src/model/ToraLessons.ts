import { v4 as uuidv4 } from "uuid";
import { Mapper } from "../services/genericService";

// Interface for a single Torah lesson
export interface ToraLesson {
  id: string;
  title: string;
  isWeekly: boolean;
  dayOfWeek?: number; // 0 = Sunday, 1 = Monday, etc.
  time?: string; // HH:mm format
  ledBy?: string;
  topic?: string;
  notes: string[]; // Free text notes
  createdAt: Date;
  updatedAt: Date;
}

// DTO interfaces for Firestore serialization
export interface ToraLessonDto {
  id: string;
  title: string;
  isWeekly: boolean;
  dayOfWeek?: number;
  time?: string;
  ledBy?: string;
  topic?: string;
  notes: string[];
  createdAt: number;
  updatedAt: number;
}

// Torah Lesson class
export class ToraLesson {
  public id: string;
  public title: string;
  public isWeekly: boolean;
  public dayOfWeek?: number;
  public time?: string;
  public ledBy?: string;
  public topic?: string;
  public notes: string[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    title: string,
    isWeekly: boolean,
    notes: string[] = [],
    dayOfWeek?: number,
    time?: string,
    ledBy?: string,
    topic?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.isWeekly = isWeekly;
    this.dayOfWeek = dayOfWeek;
    this.time = time;
    this.ledBy = ledBy;
    this.topic = topic;
    this.notes = notes;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): ToraLessonDto {
    return {
      id: this.id,
      title: this.title,
      isWeekly: this.isWeekly,
      dayOfWeek: this.dayOfWeek,
      time: this.time,
      ledBy: this.ledBy,
      topic: this.topic,
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
      dto.isWeekly,
      dto.notes,
      dto.dayOfWeek,
      dto.time,
      dto.ledBy,
      dto.topic,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new weekly Torah lesson
  static createWeekly(
    title: string,
    dayOfWeek: number,
    time: string,
    ledBy?: string,
    topic?: string,
    notes: string[] = []
  ): ToraLesson {
    return new ToraLesson(
      uuidv4(),
      title,
      true,
      notes,
      dayOfWeek,
      time,
      ledBy,
      topic
    );
  }

  // Create a new one-time Torah lesson
  static createOneTime(
    title: string,
    time?: string,
    ledBy?: string,
    topic?: string,
    notes: string[] = []
  ): ToraLesson {
    return new ToraLesson(
      uuidv4(),
      title,
      false,
      notes,
      undefined,
      time,
      ledBy,
      topic
    );
  }

  // Add a note
  addNote(note: string): ToraLesson {
    const updatedNotes = [...this.notes, note];
    return this.update({ notes: updatedNotes });
  }

  // Remove a note by index
  removeNote(index: number): ToraLesson {
    const updatedNotes = this.notes.filter((_, i) => i !== index);
    return this.update({ notes: updatedNotes });
  }

  // Update a note
  updateNote(index: number, note: string): ToraLesson {
    const updatedNotes = [...this.notes];
    updatedNotes[index] = note;
    return this.update({ notes: updatedNotes });
  }

  // Check if lesson has notes
  get hasNotes(): boolean {
    return this.notes.length > 0;
  }

  // Get number of notes
  get notesCount(): number {
    return this.notes.length;
  }

  // Get day of week name (Hebrew)
  get dayOfWeekName(): string {
    if (!this.dayOfWeek && this.dayOfWeek !== 0) return "";

    const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
    return days[this.dayOfWeek] || "";
  }

  // Get formatted time
  get formattedTime(): string {
    return this.time || "לא נקבע";
  }

  // Check if lesson has time
  get hasTime(): boolean {
    return !!this.time;
  }

  // Check if lesson has day of week
  get hasDayOfWeek(): boolean {
    return this.dayOfWeek !== undefined && this.dayOfWeek !== null;
  }

  // Get lesson type description
  get typeDescription(): string {
    return this.isWeekly ? "שיעור שבועי" : "שיעור חד פעמי";
  }

  // Get lesson schedule description
  get scheduleDescription(): string {
    if (this.isWeekly) {
      if (this.hasDayOfWeek && this.hasTime && this.time) {
        return `${this.dayOfWeekName} ${this.time}`;
      } else if (this.hasDayOfWeek) {
        return this.dayOfWeekName;
      } else if (this.hasTime && this.time) {
        return this.time;
      }
    }
    return this.hasTime && this.time ? this.time : "לא נקבע";
  }

  // Update the lesson
  update(updates: Partial<Omit<ToraLesson, "id" | "createdAt">>): ToraLesson {
    return new ToraLesson(
      this.id,
      updates.title ?? this.title,
      updates.isWeekly ?? this.isWeekly,
      updates.notes ?? this.notes,
      updates.dayOfWeek ?? this.dayOfWeek,
      updates.time ?? this.time,
      updates.ledBy ?? this.ledBy,
      updates.topic ?? this.topic,
      this.createdAt,
      new Date()
    );
  }

  // Clone the lesson
  clone(): ToraLesson {
    return new ToraLesson(
      this.id,
      this.title,
      this.isWeekly,
      [...this.notes],
      this.dayOfWeek,
      this.time,
      this.ledBy,
      this.topic,
      this.createdAt,
      this.updatedAt
    );
  }
}

// Collection of Torah lessons
export interface ToraLessonsCollection {
  id: string;
  title: string;
  description?: string;
  lessons: ToraLesson[];
  createdAt: Date;
  updatedAt: Date;
}

// DTO for collection
export interface ToraLessonsCollectionDto {
  id: string;
  title: string;
  description?: string;
  lessons: ToraLessonDto[];
  createdAt: number;
  updatedAt: number;
}

// Collection class
export class ToraLessonsCollection {
  public id: string;
  public title: string;
  public description?: string;
  public lessons: ToraLesson[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    title: string,
    lessons: ToraLesson[] = [],
    description?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.lessons = lessons;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO
  toDto(): ToraLessonsCollectionDto {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
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
      dto.lessons.map(lessonDto => ToraLesson.fromDto(lessonDto)),
      dto.description,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new collection
  static create(title: string, description?: string): ToraLessonsCollection {
    return new ToraLessonsCollection(uuidv4(), title, [], description);
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

  // Get weekly lessons
  getWeeklyLessons(): ToraLesson[] {
    return this.lessons.filter(lesson => lesson.isWeekly);
  }

  // Get one-time lessons
  getOneTimeLessons(): ToraLesson[] {
    return this.lessons.filter(lesson => !lesson.isWeekly);
  }

  // Get lessons by day of week
  getLessonsByDay(dayOfWeek: number): ToraLesson[] {
    return this.lessons.filter(lesson => lesson.dayOfWeek === dayOfWeek);
  }

  // Get lessons with time
  getLessonsWithTime(): ToraLesson[] {
    return this.lessons.filter(lesson => lesson.hasTime);
  }

  // Get lessons with notes
  getLessonsWithNotes(): ToraLesson[] {
    return this.lessons.filter(lesson => lesson.hasNotes);
  }

  // Update the collection
  update(
    updates: Partial<Omit<ToraLessonsCollection, "id" | "createdAt">>
  ): ToraLessonsCollection {
    return new ToraLessonsCollection(
      this.id,
      updates.title ?? this.title,
      updates.lessons ?? this.lessons,
      updates.description ?? this.description,
      this.createdAt,
      new Date()
    );
  }

  // Clone the collection
  clone(): ToraLessonsCollection {
    return new ToraLessonsCollection(
      this.id,
      this.title,
      this.lessons.map(lesson => lesson.clone()),
      this.description,
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
