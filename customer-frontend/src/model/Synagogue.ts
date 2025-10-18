import { Mapper } from "../services/genericService";

// DTO interface for Firestore serialization
export interface SynagogueDto {
  name: string;
  createdAt: number;
  createdBy: string;
  primaryColor?: string;
  secondaryColor?: string;
  errorColor?: string;
}

export class Synagogue {
  public id: string;
  public name: string;
  public createdAt: Date;
  public createdBy: string;
  public primaryColor?: string;
  public secondaryColor?: string;
  public errorColor?: string;

  // Static default color constants
  static readonly DEFAULT_PRIMARY_COLOR = "#9da832";
  static readonly DEFAULT_SECONDARY_COLOR = "#328ba8";
  static readonly DEFAULT_ERROR_COLOR = "#e84242";

  // Static method to get all default colors
  static getDefaultColors() {
    return {
      primaryColor: Synagogue.DEFAULT_PRIMARY_COLOR,
      secondaryColor: Synagogue.DEFAULT_SECONDARY_COLOR,
      errorColor: Synagogue.DEFAULT_ERROR_COLOR,
    };
  }

  constructor(
    id: string,
    name: string,
    createdBy: string,
    createdAt: Date = new Date(),
    primaryColor?: string,
    secondaryColor?: string,
    errorColor?: string
  ) {
    this.id = id;
    this.name = name;
    this.createdBy = createdBy;
    this.createdAt = createdAt;
    this.primaryColor = primaryColor;
    this.secondaryColor = secondaryColor;
    this.errorColor = errorColor;
  }

  // Convert to DTO for Firestore storage
  toDto(): SynagogueDto {
    return {
      name: this.name,
      createdAt: this.createdAt.getTime(),
      createdBy: this.createdBy,
      primaryColor: this.primaryColor,
      secondaryColor: this.secondaryColor,
      errorColor: this.errorColor,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: SynagogueDto, id: string): Synagogue {
    return new Synagogue(
      id,
      dto.name,
      dto.createdBy,
      new Date(dto.createdAt),
      dto.primaryColor,
      dto.secondaryColor,
      dto.errorColor
    );
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
      this.createdAt,
      updates.primaryColor ?? this.primaryColor,
      updates.secondaryColor ?? this.secondaryColor,
      updates.errorColor ?? this.errorColor
    );
  }

  // Clone the synagogue
  clone(): Synagogue {
    return new Synagogue(
      this.id,
      this.name,
      this.createdBy,
      this.createdAt,
      this.primaryColor,
      this.secondaryColor,
      this.errorColor
    );
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

  // Color getters with defaults
  get primaryColorValue(): string {
    return this.primaryColor || Synagogue.DEFAULT_PRIMARY_COLOR;
  }

  get secondaryColorValue(): string {
    return this.secondaryColor || Synagogue.DEFAULT_SECONDARY_COLOR;
  }

  get errorColorValue(): string {
    return this.errorColor || Synagogue.DEFAULT_ERROR_COLOR;
  }
}

export const synagogueMapper: Mapper<Synagogue, SynagogueDto> = {
  fromDto: (dto: SynagogueDto, id: string) => Synagogue.fromDto(dto, id),
  toDto: (entity: Synagogue) => entity.toDto(),
};
