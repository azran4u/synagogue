import { v4 as uuidv4 } from "uuid";
import { HebrewDate, HebrewDateDto } from "./HebrewDate";
import { Mapper } from "../services/genericService";

// DTO interfaces for Firestore serialization
export interface AnnouncementDto {
  id: string;
  title: string;
  content: string;
  author: string;
  publicationDate: HebrewDateDto;
  isImportant: boolean;
  createdAt: number;
  updatedAt: number;
}

// Announcement class
export class Announcement {
  public id: string;
  public title: string;
  public content: string;
  public author: string;
  public publicationDate: HebrewDate;
  public isImportant: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    title: string,
    content: string,
    author: string,
    publicationDate: HebrewDate,
    isImportant: boolean = false,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.author = author;
    this.publicationDate = publicationDate;
    this.isImportant = isImportant;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): AnnouncementDto {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      author: this.author,
      publicationDate: this.publicationDate.toDto(),
      isImportant: this.isImportant,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: AnnouncementDto): Announcement {
    return new Announcement(
      dto.id,
      dto.title,
      dto.content,
      dto.author,
      HebrewDate.fromDto(dto.publicationDate),
      dto.isImportant,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new announcement
  static create(
    title: string,
    content: string,
    author: string,
    publicationDate: HebrewDate,
    isImportant: boolean = false
  ): Announcement {
    return new Announcement(
      uuidv4(),
      title,
      content,
      author,
      publicationDate,
      isImportant
    );
  }

  // Update the announcement
  update(
    updates: Partial<Omit<Announcement, "id" | "createdAt">>
  ): Announcement {
    return new Announcement(
      this.id,
      updates.title ?? this.title,
      updates.content ?? this.content,
      updates.author ?? this.author,
      updates.publicationDate ?? this.publicationDate,
      updates.isImportant ?? this.isImportant,
      this.createdAt,
      new Date()
    );
  }

  // Clone the announcement
  clone(): Announcement {
    return new Announcement(
      this.id,
      this.title,
      this.content,
      this.author,
      this.publicationDate,
      this.isImportant,
      this.createdAt,
      this.updatedAt
    );
  }

  // Get formatted publication date
  get formattedPublicationDate(): string {
    return this.publicationDate.toString();
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
}

export const announcementMapper: Mapper<Announcement, AnnouncementDto> = {
  fromDto: Announcement.fromDto,
  toDto: (entity: Announcement) => entity.toDto(),
};
