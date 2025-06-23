import { HebrewDate, HebrewDateDto } from "./HebrewDate";
import { AliyaEvent, AliyaEventDto } from "./PrayerEvent";
import { v4 as uuidv4 } from "uuid";
// DTO interface for Firestore serialization

export interface PrayerDto {
  id: string;
  firstName: string;
  lastName: string;
  hebrewBirthDate: HebrewDateDto;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  aliyaHistory: AliyaEventDto[];
}

export class Prayer {
  public id: string;
  public firstName: string;
  public lastName: string;
  public hebrewBirthDate: HebrewDate;
  public isActive: boolean;
  public createdAt: Date;
  public updatedAt: Date;
  public aliyaHistory: AliyaEvent[];

  constructor(
    id: string,
    firstName: string,
    lastName: string,
    isActive: boolean = true,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date(),
    hebrewBirthDate: HebrewDate,
    aliyaHistory: AliyaEvent[] = []
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.hebrewBirthDate = hebrewBirthDate;
    this.isActive = isActive;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.aliyaHistory = aliyaHistory;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerDto {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      hebrewBirthDate: this.hebrewBirthDate?.toDto(),
      isActive: this.isActive,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
      aliyaHistory: this.aliyaHistory.map(event => event.toDto()),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: PrayerDto): Prayer {
    return new Prayer(
      dto.id,
      dto.firstName,
      dto.lastName,
      dto.isActive,
      new Date(dto.createdAt),
      new Date(dto.updatedAt),
      HebrewDate.fromDto(dto.hebrewBirthDate),
      dto.aliyaHistory.map(eventDto => AliyaEvent.fromDto(eventDto))
    );
  }

  // Create a new Prayer without ID (for creation)
  static create(
    firstName: string,
    lastName: string,
    hebrewBirthDate: HebrewDate,
    aliyaHistory?: AliyaEvent[],
    isActive?: boolean,
    createdAt?: Date,
    updatedAt?: Date
  ): Prayer {
    return new Prayer(
      uuidv4(),
      firstName,
      lastName,
      isActive ?? true,
      new Date(),
      new Date(),
      hebrewBirthDate,
      aliyaHistory ?? []
    );
  }

  // Update the prayer
  update(updates: Partial<Omit<Prayer, "id" | "createdAt">>): Prayer {
    return new Prayer(
      this.id,
      updates.firstName ?? this.firstName,
      updates.lastName ?? this.lastName,
      updates.isActive ?? this.isActive,
      this.createdAt,
      new Date(), // updatedAt
      updates.hebrewBirthDate ?? this.hebrewBirthDate,
      updates.aliyaHistory ?? this.aliyaHistory
    );
  }

  // Get full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  // Check if prayer is active
  get isActivePrayer(): boolean {
    return this.isActive;
  }

  // Add an aliya event
  addAliyaEvent(eventType: AliyaEvent): Prayer {
    const updatedAliyaHistory = [...this.aliyaHistory, eventType];
    return this.update({ aliyaHistory: updatedAliyaHistory });
  }

  // Deactivate the prayer
  deactivate(): Prayer {
    return this.update({ isActive: false });
  }

  // Activate the prayer
  activate(): Prayer {
    return this.update({ isActive: true });
  }
}
