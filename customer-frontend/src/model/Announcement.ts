import { v4 as uuidv4 } from "uuid";
import { HebrewDate, HebrewDateDto } from "./HebrewDate";
import { Mapper } from "../services/genericService";

// DTO interfaces for Firestore serialization
export interface AnnouncementDto {
  id: string;
  title: string;
  content: string;
  is_important: boolean;
  enabled: boolean;
  displayOrder: number;
  createdAt: number;
  createdBy: string;
}

// Announcement class
export class Announcement {
  public id: string;
  public title: string;
  public content: string;
  public is_important: boolean;
  public enabled: boolean;
  public displayOrder: number;
  public createdAt: Date;
  public createdBy: string;

  constructor(
    id: string,
    title: string,
    content: string,
    createdBy: string,
    is_important: boolean = false,
    enabled: boolean = true,
    displayOrder: number = 1,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.createdBy = createdBy;
    this.is_important = is_important;
    this.enabled = enabled;
    this.displayOrder = displayOrder;
    this.createdAt = createdAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): AnnouncementDto {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      is_important: this.is_important,
      enabled: this.enabled,
      displayOrder: this.displayOrder,
      createdAt: this.createdAt.getTime(),
      createdBy: this.createdBy,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: AnnouncementDto): Announcement {
    return new Announcement(
      dto.id,
      dto.title,
      dto.content,
      dto.createdBy,
      dto.is_important,
      dto.enabled,
      dto.displayOrder,
      new Date(dto.createdAt)
    );
  }

  // Create a new announcement
  static create(
    title: string,
    content: string,
    createdBy: string,
    is_important: boolean = false,
    displayOrder: number = 1
  ): Announcement {
    return new Announcement(
      uuidv4(),
      title,
      content,
      createdBy,
      is_important,
      true, // enabled by default
      displayOrder
    );
  }

  // Update the announcement
  update(
    updates: Partial<Omit<Announcement, "id" | "createdAt" | "createdBy">>
  ): Announcement {
    return new Announcement(
      this.id,
      updates.title ?? this.title,
      updates.content ?? this.content,
      this.createdBy,
      updates.is_important ?? this.is_important,
      updates.enabled ?? this.enabled,
      updates.displayOrder ?? this.displayOrder,
      this.createdAt
    );
  }

  // Clone the announcement
  clone(): Announcement {
    return new Announcement(
      this.id,
      this.title,
      this.content,
      this.createdBy,
      this.is_important,
      this.enabled,
      this.displayOrder,
      this.createdAt
    );
  }

  // Enable the announcement
  enable(): Announcement {
    return this.update({ enabled: true });
  }

  // Disable the announcement
  disable(): Announcement {
    return this.update({ enabled: false });
  }

  // Mark as important
  markAsImportant(): Announcement {
    return this.update({ is_important: true });
  }

  // Mark as not important
  markAsNotImportant(): Announcement {
    return this.update({ is_important: false });
  }

  // Get announcement age in days
  get ageInDays(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if announcement is recent (within 7 days)
  get isRecent(): boolean {
    return this.ageInDays <= 7;
  }

  // Get content preview (first 100 characters)
  get contentPreview(): string {
    if (this.content.length <= 100) {
      return this.content;
    }
    return this.content.substring(0, 100) + "...";
  }

  // Check if announcement is enabled
  get isEnabled(): boolean {
    return this.enabled;
  }

  // Check if announcement is important
  get isImportant(): boolean {
    return this.is_important;
  }
}

export const announcementMapper: Mapper<Announcement, AnnouncementDto> = {
  fromDto: Announcement.fromDto,
  toDto: (entity: Announcement) => entity.toDto(),
};
