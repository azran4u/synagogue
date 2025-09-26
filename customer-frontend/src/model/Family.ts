import { v4 as uuidv4 } from "uuid";
import { Mapper } from "../services/genericService";

// DTO interface for Firestore serialization
export interface FamilyDto {
  id: string;
  familyLabel: string;
  notes?: string;
  createdAt: number;
  createdBy: string;
}

export class Family {
  public id: string;
  public familyLabel: string;
  public notes?: string;
  public createdAt: Date;
  public createdBy: string;

  constructor(
    id: string,
    familyLabel: string,
    createdBy: string,
    notes?: string,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.familyLabel = familyLabel;
    this.notes = notes;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
  }

  // Convert to DTO for Firestore storage
  toDto(): FamilyDto {
    return {
      id: this.id,
      familyLabel: this.familyLabel,
      notes: this.notes,
      createdAt: this.createdAt.getTime(),
      createdBy: this.createdBy,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: FamilyDto): Family {
    return new Family(
      dto.id,
      dto.familyLabel,
      dto.createdBy,
      dto.notes,
      new Date(dto.createdAt)
    );
  }

  // Create a new Family without ID (for creation)
  static create(
    familyLabel: string,
    createdBy: string,
    notes?: string
  ): Family {
    return new Family(uuidv4(), familyLabel, createdBy, notes, new Date());
  }

  // Update the family
  update(
    updates: Partial<Omit<Family, "id" | "createdAt" | "createdBy">>
  ): Family {
    return new Family(
      this.id,
      updates.familyLabel ?? this.familyLabel,
      this.createdBy,
      updates.notes ?? this.notes,
      this.createdAt
    );
  }

  // Check if family has notes
  get hasNotes(): boolean {
    return !!(this.notes && this.notes.trim().length > 0);
  }

  // Get formatted creation date
  get formattedCreatedAt(): string {
    return this.createdAt.toLocaleDateString("he-IL");
  }
}

export const familyMapper: Mapper<Family, FamilyDto> = {
  fromDto: Family.fromDto,
  toDto: (entity: Family) => entity.toDto(),
};
