import { HebrewDate, HebrewDateDto } from "./HebrewDate";
import { v4 as uuidv4 } from "uuid";

// Aliya event types
export const AliyaEventType = {
  PTICHAT_HAHECHAL: "פתיחת ההיכל",
  HOLACHAT_SEFER_TORAH: "הולכת ספרת תורה",
  RISHON: "ראשון",
  SHENI: "שני",
  SHLISHI: "שלישי",
  REVIEI: "רביעי",
  HAMISHI: "חמישי",
  SHISHI: "שישי",
  SHVEI: "שביעי",
  MAFTIR: "מפטיר",
  HAFTARA: "חפטרה",
  MOSIF: "מוסיף",
  OTHER: "אחר",
} as const;

export type AliyaEventType =
  (typeof AliyaEventType)[keyof typeof AliyaEventType];

// Base DTO interface for Firestore serialization
export interface EventDto {
  id: string;
  date: HebrewDateDto;
  description?: string;
  createdAt: number;
  updatedAt: number;
}

// Aliya Event DTO
export interface AliyaEventDto extends EventDto {
  type: AliyaEventType;
}

// Base Event class for non-recurring events
abstract class BaseEvent {
  public id: string;
  public date: HebrewDate;
  public description?: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    date: HebrewDate,
    description?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.date = date;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Abstract method that subclasses must implement
  abstract toDto(): EventDto;
  abstract get typeDisplayName(): string;

  // Common methods
  equals(other: BaseEvent): boolean {
    return this.id === other.id;
  }

  clone(): BaseEvent {
    return this.createClone();
  }

  update(updates: Partial<Omit<BaseEvent, "id" | "createdAt">>): BaseEvent {
    return this.createUpdatedInstance(updates);
  }

  // Abstract methods for subclasses
  protected abstract createClone(): BaseEvent;
  protected abstract createUpdatedInstance(
    updates: Partial<Omit<BaseEvent, "id" | "createdAt">>
  ): BaseEvent;
}

// Aliya Event class
export class AliyaEvent extends BaseEvent {
  public type: AliyaEventType;

  constructor(
    id: string,
    type: AliyaEventType,
    date: HebrewDate,
    description?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    super(id, date, description, createdAt, updatedAt);
    this.type = type;
  }

  // Convert to DTO for Firestore storage
  toDto(): AliyaEventDto {
    return {
      id: this.id,
      type: this.type,
      date: this.date.toDto(),
      description: this.description,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: AliyaEventDto): AliyaEvent {
    return new AliyaEvent(
      dto.id,
      dto.type,
      HebrewDate.fromDto(dto.date),
      dto.description,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new AliyaEvent without ID (for creation)
  static create(
    type: AliyaEventType,
    date: HebrewDate,
    description?: string
  ): AliyaEvent {
    return new AliyaEvent(
      uuidv4(),
      type,
      date,
      description,
      new Date(),
      new Date()
    );
  }

  // Get event type display name
  get typeDisplayName(): string {
    return this.type;
  }

  // Check if this is a Torah reading aliya
  get isTorahReading(): boolean {
    const torahReadings: AliyaEventType[] = [
      AliyaEventType.RISHON,
      AliyaEventType.SHENI,
      AliyaEventType.SHLISHI,
      AliyaEventType.REVIEI,
      AliyaEventType.HAMISHI,
      AliyaEventType.SHISHI,
      AliyaEventType.SHVEI,
      AliyaEventType.MAFTIR,
    ];
    return torahReadings.includes(this.type);
  }

  // Check if this is a special aliya (not Torah reading)
  get isSpecialAliya(): boolean {
    const specialAliyas: AliyaEventType[] = [
      AliyaEventType.PTICHAT_HAHECHAL,
      AliyaEventType.HOLACHAT_SEFER_TORAH,
      AliyaEventType.HAFTARA,
      AliyaEventType.MOSIF,
      AliyaEventType.OTHER,
    ];
    return specialAliyas.includes(this.type);
  }

  // Clone the event
  protected createClone(): AliyaEvent {
    return new AliyaEvent(
      this.id,
      this.type,
      this.date,
      this.description,
      this.createdAt,
      this.updatedAt
    );
  }

  // Create updated instance
  protected createUpdatedInstance(
    updates: Partial<Omit<BaseEvent, "id" | "createdAt">>
  ): AliyaEvent {
    return new AliyaEvent(
      this.id,
      this.type,
      updates.date ?? this.date,
      updates.description ?? this.description,
      this.createdAt,
      new Date()
    );
  }

  // Get all available aliya event types
  static getAllTypes(): AliyaEventType[] {
    return Object.values(AliyaEventType);
  }
}
