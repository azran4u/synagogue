import { v4 as uuidv4 } from "uuid";
import { Mapper } from "../services/genericService";

// DTO interface for Firestore serialization
export interface AliyaTypeDto {
  id: string;
  displayName: string;
  weight: number;
  enabled: boolean;
  description?: string;
  displayOrder?: number;
}

export class AliyaType {
  public id: string;
  public displayName: string;
  public weight: number;
  public enabled: boolean;
  public description?: string;
  public displayOrder?: number;

  constructor(
    id: string,
    displayName: string,
    weight: number = 1,
    enabled: boolean = true,
    description?: string,
    displayOrder?: number
  ) {
    this.id = id;
    this.displayName = displayName;
    this.weight = weight;
    this.enabled = enabled;
    this.description = description;
    this.displayOrder = displayOrder;
  }

  // Convert to DTO for Firestore storage
  toDto(): AliyaTypeDto {
    return {
      id: this.id,
      displayName: this.displayName,
      weight: this.weight,
      enabled: this.enabled,
      description: this.description,
      displayOrder: this.displayOrder,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: AliyaTypeDto): AliyaType {
    return new AliyaType(
      dto.id,
      dto.displayName,
      dto.weight,
      dto.enabled,
      dto.description,
      dto.displayOrder
    );
  }

  // Create a new AliyaType without ID (for creation)
  static create(
    displayName: string,
    weight: number = 1,
    description?: string,
    displayOrder?: number
  ): AliyaType {
    return new AliyaType(
      uuidv4(),
      displayName,
      weight,
      true, // enabled by default
      description,
      displayOrder
    );
  }

  // Update the aliya type
  update(updates: Partial<Omit<AliyaType, "id">>): AliyaType {
    return new AliyaType(
      this.id,
      updates.displayName ?? this.displayName,
      updates.weight ?? this.weight,
      updates.enabled ?? this.enabled,
      updates.description ?? this.description,
      updates.displayOrder ?? this.displayOrder
    );
  }

  // Enable the aliya type
  enable(): AliyaType {
    return this.update({ enabled: true });
  }

  // Disable the aliya type
  disable(): AliyaType {
    return this.update({ enabled: false });
  }

  // Update the weight
  updateWeight(newWeight: number): AliyaType {
    return this.update({ weight: newWeight });
  }

  // Check if aliya type is enabled
  get isEnabled(): boolean {
    return this.enabled;
  }

  // Check if aliya type has description
  get hasDescription(): boolean {
    return !!(this.description && this.description.trim().length > 0);
  }

  // Check if aliya type is high priority (weight > 5)
  get isHighPriority(): boolean {
    return this.weight > 5;
  }

  // Check if aliya type is medium priority (weight 3-5)
  get isMediumPriority(): boolean {
    return this.weight >= 3 && this.weight <= 5;
  }

  // Check if aliya type is low priority (weight < 3)
  get isLowPriority(): boolean {
    return this.weight < 3;
  }

  // Get priority description (Hebrew)
  get priorityDescription(): string {
    if (this.isHighPriority) {
      return "עדיפות גבוהה";
    } else if (this.isMediumPriority) {
      return "עדיפות בינונית";
    } else {
      return "עדיפות נמוכה";
    }
  }

  // Validate the aliya type data (matches Firebase rules)
  static validate(data: Partial<AliyaTypeDto>): string[] {
    const errors: string[] = [];

    if (
      !data.displayName ||
      typeof data.displayName !== "string" ||
      data.displayName.trim().length === 0
    ) {
      errors.push("Display name is required and must be a non-empty string");
    }

    if (typeof data.weight !== "number" || !Number.isFinite(data.weight)) {
      errors.push("Weight must be a valid number");
    }

    if (typeof data.enabled !== "boolean") {
      errors.push("Enabled must be a boolean value");
    }

    if (
      data.description !== undefined &&
      typeof data.description !== "string"
    ) {
      errors.push("Description must be a string if provided");
    }

    if (
      data.displayOrder !== undefined &&
      (typeof data.displayOrder !== "number" ||
        !Number.isInteger(data.displayOrder))
    ) {
      errors.push("Display order must be an integer if provided");
    }

    return errors;
  }

  // Clone the aliya type
  clone(): AliyaType {
    return new AliyaType(
      this.id,
      this.displayName,
      this.weight,
      this.enabled,
      this.description,
      this.displayOrder
    );
  }
}

export const aliyaTypeMapper: Mapper<AliyaType, AliyaTypeDto> = {
  fromDto: AliyaType.fromDto,
  toDto: (entity: AliyaType) => entity.toDto(),
};
