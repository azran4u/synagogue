import { v4 as uuidv4 } from "uuid";
import { Mapper } from "../services/genericService";

// DTO interfaces for Firestore serialization
export interface ToraLessonDto {
  id: string;
  title: string;
  ledBy?: string;
  when?: string;
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
  public when: string;
  public displayOrder: number;
  public enabled: boolean;
  public notes?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    title: string,
    ledBy: string,
    when: string,
    displayOrder: number = 1,
    enabled: boolean = true,
    notes?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.ledBy = ledBy;
    this.when = when;
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
      when: this.when,
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
      dto.ledBy ?? "",
      dto.when ?? "",
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
    when: string,
    displayOrder: number = 1,
    notes?: string
  ): ToraLesson {
    return new ToraLesson(
      uuidv4(),
      title,
      ledBy,
      when,
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

  // Update the lesson
  update(updates: Partial<Omit<ToraLesson, "id" | "createdAt">>): ToraLesson {
    return new ToraLesson(
      this.id,
      updates.title ?? this.title,
      updates.ledBy ?? this.ledBy,
      updates.when ?? this.when,
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
      this.when,
      this.displayOrder,
      this.enabled,
      this.notes,
      this.createdAt,
      this.updatedAt
    );
  }
}

export const toraLessonsMapper: Mapper<ToraLesson, ToraLessonDto> = {
  fromDto: ToraLesson.fromDto,
  toDto: (entity: ToraLesson) => entity.toDto(),
};
