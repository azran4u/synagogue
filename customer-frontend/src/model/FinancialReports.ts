import { v4 as uuidv4 } from "uuid";
import { HebrewDate, HebrewDateDto } from "./HebrewDate";
import { Mapper } from "../services/genericService";

// DTO interfaces for Firestore serialization
export interface FinancialReportDto {
  id: string;
  title: string;
  linkToDocument: string;
  fileExtension?: string;
  displayOrder: number;
  enabled: boolean;
  createdAt: number;
  createdBy: string;
  content: string;
  hebrewDate: HebrewDateDto;
}

// Financial Report class
export class FinancialReport {
  public id: string;
  public title: string;
  public displayOrder: number;
  public linkToDocument: string;
  public fileExtension?: string;
  public enabled: boolean;
  public createdAt: Date;
  public createdBy: string;
  public content: string;
  public hebrewDate: HebrewDate;

  constructor(
    id: string,
    title: string,
    displayOrder: number,
    linkToDocument: string,
    createdBy: string,
    content: string,
    hebrewDate: HebrewDate,
    enabled: boolean = true,
    createdAt: Date = new Date(),
    fileExtension?: string
  ) {
    this.id = id;
    this.title = title;
    this.displayOrder = displayOrder;
    this.linkToDocument = linkToDocument;
    this.createdBy = createdBy;
    this.content = content;
    this.hebrewDate = hebrewDate;
    this.enabled = enabled;
    this.createdAt = createdAt;
    this.fileExtension = fileExtension;
  }

  // Convert to DTO for Firestore storage
  toDto(): FinancialReportDto {
    return {
      id: this.id,
      title: this.title,
      displayOrder: this.displayOrder,
      linkToDocument: this.linkToDocument,
      fileExtension: this.fileExtension,
      enabled: this.enabled,
      createdAt: this.createdAt.getTime(),
      createdBy: this.createdBy,
      content: this.content,
      hebrewDate: this.hebrewDate.toDto(),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: FinancialReportDto): FinancialReport {
    return new FinancialReport(
      dto.id,
      dto.title,
      dto.displayOrder,
      dto.linkToDocument,
      dto.createdBy,
      dto.content,
      HebrewDate.fromDto(dto.hebrewDate),
      dto.enabled,
      new Date(dto.createdAt),
      dto.fileExtension
    );
  }

  // Create a new financial report
  static create(
    title: string,
    linkToDocument: string,
    createdBy: string,
    content: string,
    displayOrder: number = 1,
    hebrewDate?: HebrewDate
  ): FinancialReport {
    return new FinancialReport(
      uuidv4(),
      title,
      displayOrder,
      linkToDocument,
      createdBy,
      content,
      hebrewDate ?? HebrewDate.now(),
      true // enabled by default
    );
  }

  // Update the report
  update(
    updates: Partial<Omit<FinancialReport, "id" | "createdAt" | "createdBy">>
  ): FinancialReport {
    return new FinancialReport(
      this.id,
      updates.title ?? this.title,
      updates.displayOrder ?? this.displayOrder,
      updates.linkToDocument ?? this.linkToDocument,
      this.createdBy,
      updates.content ?? this.content,
      updates.hebrewDate ?? HebrewDate.now(),
      updates.enabled ?? this.enabled,
      this.createdAt,
      updates.fileExtension ?? this.fileExtension
    );
  }

  // Clone the report
  clone(): FinancialReport {
    return new FinancialReport(
      this.id,
      this.title,
      this.displayOrder,
      this.linkToDocument,
      this.createdBy,
      this.content,
      this.hebrewDate.clone(),
      this.enabled,
      this.createdAt,
      this.fileExtension
    );
  }

  // Enable the report
  enable(): FinancialReport {
    return this.update({ enabled: true });
  }

  // Disable the report
  disable(): FinancialReport {
    return this.update({ enabled: false });
  }

  // Check if report has content
  get hasContent(): boolean {
    return !!(this.content && this.content.trim().length > 0);
  }

  // Check if report is enabled
  get isEnabled(): boolean {
    return this.enabled;
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

  // Get content preview (first 200 characters)
  get contentPreview(): string {
    if (!this.content || this.content.length <= 200) {
      return this.content || "";
    }
    return this.content.substring(0, 200) + "...";
  }

  // Get the storage path for this report's file
  getStoragePath(synagogueId: string): string | null {
    if (!this.fileExtension) return null;
    return `${synagogueId}/financialReports/${this.id}.${this.fileExtension}`;
  }
}

export const financialReportsMapper: Mapper<
  FinancialReport,
  FinancialReportDto
> = {
  fromDto: FinancialReport.fromDto,
  toDto: (entity: FinancialReport) => entity.toDto(),
};
