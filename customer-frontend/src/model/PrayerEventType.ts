import { v4 as uuidv4 } from "uuid";
import { Mapper } from "../services/genericService";

// DTO interface for Firestore serialization
export interface PrayerEventTypeDto {
  id: string;
  displayName: string;
  recurrenceType: "none" | "yearly";
  enabled: boolean;
  description?: string;
  displayOrder?: number;
}

export class PrayerEventType {
  public id: string;
  public displayName: string;
  public recurrenceType: "none" | "yearly";
  public enabled: boolean;
  public description?: string;
  public displayOrder?: number;

  constructor(
    id: string,
    displayName: string,
    recurrenceType: "none" | "yearly" = "none",
    enabled: boolean = true,
    description?: string,
    displayOrder?: number
  ) {
    this.id = id;
    this.displayName = displayName;
    this.recurrenceType = recurrenceType;
    this.enabled = enabled;
    this.description = description;
    this.displayOrder = displayOrder;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerEventTypeDto {
    return {
      id: this.id,
      displayName: this.displayName,
      recurrenceType: this.recurrenceType,
      enabled: this.enabled,
      description: this.description,
      displayOrder: this.displayOrder,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: PrayerEventTypeDto): PrayerEventType {
    return new PrayerEventType(
      dto.id,
      dto.displayName,
      dto.recurrenceType,
      dto.enabled,
      dto.description,
      dto.displayOrder
    );
  }

  // Create a new PrayerEventType without ID (for creation)
  static create(
    displayName: string,
    recurrenceType: "none" | "yearly" = "none",
    description?: string,
    displayOrder?: number
  ): PrayerEventType {
    return new PrayerEventType(
      uuidv4(),
      displayName,
      recurrenceType,
      true, // enabled by default
      description,
      displayOrder
    );
  }

  // Update the prayer event type
  update(updates: Partial<Omit<PrayerEventType, "id">>): PrayerEventType {
    return new PrayerEventType(
      this.id,
      updates.displayName ?? this.displayName,
      updates.recurrenceType ?? this.recurrenceType,
      updates.enabled ?? this.enabled,
      updates.description ?? this.description,
      updates.displayOrder ?? this.displayOrder
    );
  }

  // Enable the prayer event type
  enable(): PrayerEventType {
    return this.update({ enabled: true });
  }

  // Disable the prayer event type
  disable(): PrayerEventType {
    return this.update({ enabled: false });
  }

  // Check if prayer event type is enabled
  get isEnabled(): boolean {
    return this.enabled;
  }

  // Check if prayer event type has description
  get hasDescription(): boolean {
    return !!(this.description && this.description.trim().length > 0);
  }

  // Check if prayer event type is recurring
  get isRecurring(): boolean {
    return this.recurrenceType === "yearly";
  }

  // Check if prayer event type is one-time
  get isOneTime(): boolean {
    return this.recurrenceType === "none";
  }

  // Get recurrence type description (Hebrew)
  get recurrenceTypeDescription(): string {
    switch (this.recurrenceType) {
      case "none":
        return "חד פעמי";
      case "yearly":
        return "שנתי";
      default:
        return "לא ידוע";
    }
  }

  // Validate the prayer event type data (matches Firebase rules)
  static validate(data: Partial<PrayerEventTypeDto>): string[] {
    const errors: string[] = [];

    if (
      !data.displayName ||
      typeof data.displayName !== "string" ||
      data.displayName.trim().length === 0
    ) {
      errors.push("Display name is required and must be a non-empty string");
    }

    if (
      !data.recurrenceType ||
      !["none", "yearly"].includes(data.recurrenceType)
    ) {
      errors.push('Recurrence type must be either "none" or "yearly"');
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

  // Clone the prayer event type
  clone(): PrayerEventType {
    return new PrayerEventType(
      this.id,
      this.displayName,
      this.recurrenceType,
      this.enabled,
      this.description,
      this.displayOrder
    );
  }
}

export const prayerEventTypeMapper: Mapper<
  PrayerEventType,
  PrayerEventTypeDto
> = {
  fromDto: PrayerEventType.fromDto,
  toDto: (entity: PrayerEventType) => entity.toDto(),
};
