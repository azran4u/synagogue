// Aliya Event DTO (matches Firebase schema)
export interface AliyaEventDto {
  aliyaGroupId: string;
  aliyaType: string;
}

export class AliyaEvent {
  public aliyaGroupId: string;
  public aliyaType: string;
  constructor(aliyaGroupId: string, aliyaType: string) {
    this.aliyaGroupId = aliyaGroupId;
    this.aliyaType = aliyaType;
  }

  // Convert to DTO for Firestore storage
  toDto(): AliyaEventDto {
    return {
      aliyaGroupId: this.aliyaGroupId,
      aliyaType: this.aliyaType,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: AliyaEventDto): AliyaEvent {
    return new AliyaEvent(dto.aliyaGroupId, dto.aliyaType);
  }

  // Create a new AliyaEvent
  static create(aliyaGroupId: string, aliyaType: string): AliyaEvent {
    return new AliyaEvent(aliyaGroupId, aliyaType);
  }

  // Update the aliya event
  update(updates: Partial<AliyaEvent>): AliyaEvent {
    return new AliyaEvent(
      updates.aliyaGroupId ?? this.aliyaGroupId,
      updates.aliyaType ?? this.aliyaType
    );
  }

  // Get aliya type description
  get typeDescription(): string {
    return this.aliyaType;
  }

  // Clone the aliya event
  clone(): AliyaEvent {
    return new AliyaEvent(this.aliyaGroupId, this.aliyaType);
  }
}
