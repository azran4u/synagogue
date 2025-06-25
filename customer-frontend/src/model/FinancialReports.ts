import { v4 as uuidv4 } from "uuid";
import { HebrewDate, HebrewDateDto } from "./HebrewDate";
import { Mapper } from "../services/genericService";

// DTO interfaces for Firestore serialization
export interface FinancialReportDto {
  id: string;
  title: string;
  publicationDate: HebrewDateDto;
  pdfLink: string;
  notes?: string;
  publishedBy: string;
  createdAt: number;
  updatedAt: number;
}

// Financial Report class
export class FinancialReport {
  public id: string;
  public title: string;
  public publicationDate: HebrewDate;
  public pdfLink: string;
  public notes?: string;
  public publishedBy: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    title: string,
    publicationDate: HebrewDate,
    pdfLink: string,
    publishedBy: string,
    notes?: string,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.publicationDate = publicationDate;
    this.pdfLink = pdfLink;
    this.notes = notes;
    this.publishedBy = publishedBy;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): FinancialReportDto {
    return {
      id: this.id,
      title: this.title,
      publicationDate: this.publicationDate.toDto(),
      pdfLink: this.pdfLink,
      notes: this.notes,
      publishedBy: this.publishedBy,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: FinancialReportDto): FinancialReport {
    return new FinancialReport(
      dto.id,
      dto.title,
      HebrewDate.fromDto(dto.publicationDate),
      dto.pdfLink,
      dto.publishedBy,
      dto.notes,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new financial report
  static create(
    title: string,
    publicationDate: HebrewDate,
    pdfLink: string,
    publishedBy: string,
    notes?: string
  ): FinancialReport {
    return new FinancialReport(
      uuidv4(),
      title,
      publicationDate,
      pdfLink,
      publishedBy,
      notes
    );
  }

  // Update the report
  update(
    updates: Partial<Omit<FinancialReport, "id" | "createdAt">>
  ): FinancialReport {
    return new FinancialReport(
      this.id,
      updates.title ?? this.title,
      updates.publicationDate ?? this.publicationDate,
      updates.pdfLink ?? this.pdfLink,
      updates.publishedBy ?? this.publishedBy,
      updates.notes ?? this.notes,
      this.createdAt,
      new Date()
    );
  }

  // Clone the report
  clone(): FinancialReport {
    return new FinancialReport(
      this.id,
      this.title,
      this.publicationDate,
      this.pdfLink,
      this.publishedBy,
      this.notes,
      this.createdAt,
      this.updatedAt
    );
  }

  // Check if report has notes
  get hasNotes(): boolean {
    if (!this.notes) return false;
    return this.notes.trim().length > 0;
  }

  // Get formatted publication date
  get formattedPublicationDate(): string {
    return this.publicationDate.toString();
  }

  // Get report age in days
  get ageInDays(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if report is recent (within 30 days)
  get isRecent(): boolean {
    return this.ageInDays <= 30;
  }
}

export const financialReportsMapper: Mapper<
  FinancialReport,
  FinancialReportDto
> = {
  fromDto: FinancialReport.fromDto,
  toDto: (entity: FinancialReport) => entity.toDto(),
};
