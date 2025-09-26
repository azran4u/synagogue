import { Mapper } from "../services/genericService";

// DTO interface for Firestore serialization
export interface SynagogueDto {
  name: string;
  createdAt: number;
  createdBy: string;
}

export class Synagogue {
  public id: string;
  public name: string;
  public createdAt: Date;
  public createdBy: string;

  constructor(
    id: string,
    name: string,
    createdBy: string,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.name = name;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): SynagogueDto {
    return {
      name: this.name,
      createdAt: this.createdAt.getTime(),
      createdBy: this.createdBy,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: SynagogueDto, id: string): Synagogue {
    return new Synagogue(id, dto.name, dto.createdBy, new Date(dto.createdAt));
  }

  // Create a new Synagogue
  static create(name: string, createdBy: string): Synagogue {
    return new Synagogue("", name, createdBy, new Date());
  }

  // Update the synagogue
  update(
    updates: Partial<Omit<Synagogue, "id" | "createdAt" | "createdBy">>
  ): Synagogue {
    return new Synagogue(
      this.id,
      updates.name ?? this.name,
      this.createdBy,
      this.createdAt
    );
  }

  // Clone the synagogue
  clone(): Synagogue {
    return new Synagogue(this.id, this.name, this.createdBy, this.createdAt);
  }

  // Validation
  get isValid(): boolean {
    return !!(this.name && this.name.trim().length > 0);
  }

  // Formatted display
  get displayName(): string {
    return this.name;
  }

  get formattedCreatedAt(): string {
    return this.createdAt.toLocaleDateString("he-IL");
  }
}

export const synagogueMapper: Mapper<Synagogue, SynagogueDto> = {
  fromDto: (dto: SynagogueDto, id: string) => Synagogue.fromDto(dto, id),
  toDto: (entity: Synagogue) => entity.toDto(),
};
