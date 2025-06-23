import { Prayer, PrayerDto } from "./Prayer";
import {
  PrayerEvent,
  PrayerEventDto,
  AliyaEvent,
  AliyaEventDto,
  AliyaEventType,
} from "./PrayerEvent";
import { HebrewDate } from "./HebrewDate";
import { v4 as uuidv4 } from "uuid";

// DTO interface for Firestore serialization
export interface PrayerCardDto {
  id: string;
  prayer: PrayerDto;
  events: PrayerEventDto[];
  children: PrayerDto[];
  email: string;
  createdAt: number;
  updatedAt: number;
}

export class PrayerCard {
  public id: string;
  public prayer: Prayer;
  public events: PrayerEvent[];
  public children: Prayer[];
  public email: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    prayer: Prayer,
    events: PrayerEvent[],
    children: Prayer[],
    email: string,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.prayer = prayer;
    this.events = events;
    this.children = children;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerCardDto {
    return {
      id: this.id,
      prayer: this.prayer.toDto(),
      events: this.events.map(event => event.toDto()),
      children: this.children.map(child => child.toDto()),
      email: this.email,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: PrayerCardDto): PrayerCard {
    return new PrayerCard(
      dto.id,
      Prayer.fromDto(dto.prayer),
      dto.events.map(eventDto => PrayerEvent.fromDto(eventDto)),
      dto.children.map(childDto => Prayer.fromDto(childDto)),
      dto.email,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new PrayerCard without ID (for creation)
  static create(
    prayer: Prayer,
    events: PrayerEvent[],
    children: Prayer[],
    email: string,
    createdAt?: Date,
    updatedAt?: Date
  ): PrayerCard {
    return new PrayerCard(
      uuidv4(),
      prayer,
      events,
      children,
      email,
      createdAt ?? new Date(),
      updatedAt ?? new Date()
    );
  }

  // Add a child
  addChild(child: Prayer): PrayerCard {
    const updatedChildren = [...this.children, child];
    return this.update({ children: updatedChildren }) as PrayerCard;
  }

  // Remove a child
  removeChild(childId: string): PrayerCard {
    const updatedChildren = this.children.filter(child => child.id !== childId);
    return this.update({ children: updatedChildren }) as PrayerCard;
  }

  // Add an event (either PrayerEvent or AliyaEvent)
  addPrayerEvent(event: PrayerEvent): PrayerCard {
    const updatedEvents = [...this.events, event];
    return this.update({ events: updatedEvents }) as PrayerCard;
  }

  // Remove an event by index
  removePrayerEvent(index: number): PrayerCard {
    const updatedEvents = this.events.filter((_, i) => i !== index);
    return this.update({ events: updatedEvents }) as PrayerCard;
  }

  // Get all prayer events
  get prayerEventsOnly(): PrayerEvent[] {
    return this.events.filter(
      event => event instanceof PrayerEvent
    ) as PrayerEvent[];
  }

  // Override update method to return PrayerCard
  update(updates: Partial<Omit<PrayerCard, "id" | "createdAt">>): PrayerCard {
    return new PrayerCard(
      this.id,
      updates.prayer ?? this.prayer,
      updates.events ?? this.events,
      updates.children ?? this.children,
      updates.email ?? this.email,
      this.createdAt,
      new Date()
    );
  }
}
