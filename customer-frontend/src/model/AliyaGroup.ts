import { HebrewDate } from "./HebrewDate";
import { v4 as uuidv4 } from "uuid";
import { HebrewDateDto } from "./HebrewDate";

export interface AliyaGroupDto {
  id: string;
  label: string;
  hebrewDate: HebrewDateDto;
  createdAt: string;
  updatedAt: string;
  assignments?: Record<string, string>; // aliyaTypeId -> prayerId
}

export class AliyaGroup {
  public id: string;
  public label: string;
  public hebrewDate: HebrewDate;
  public createdAt: Date;
  public updatedAt: Date;
  public assignments: Record<string, string>; // aliyaTypeId -> prayerId

  constructor(
    id: string,
    label: string,
    hebrewDate: HebrewDate,
    createdAt: Date,
    updatedAt: Date,
    assignments: Record<string, string> = {}
  ) {
    this.id = id;
    this.label = label;
    this.hebrewDate = hebrewDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.assignments = assignments;
  }

  toDto(): AliyaGroupDto {
    return {
      id: this.id,
      label: this.label,
      hebrewDate: this.hebrewDate.toDto(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      assignments: this.assignments,
    };
  }

  static fromDto(dto: AliyaGroupDto): AliyaGroup {
    return new AliyaGroup(
      dto.id,
      dto.label,
      HebrewDate.fromDto(dto.hebrewDate),
      new Date(dto.createdAt),
      new Date(dto.updatedAt),
      dto.assignments || {}
    );
  }

  static create(label: string, hebrewDate: HebrewDate): AliyaGroup {
    const now = new Date();
    const id = uuidv4();

    return new AliyaGroup(id, label, hebrewDate, now, now, {});
  }

  update(
    updates: Partial<Pick<AliyaGroup, "label" | "hebrewDate" | "assignments">>
  ): AliyaGroup {
    return new AliyaGroup(
      this.id,
      updates.label ?? this.label,
      updates.hebrewDate ?? this.hebrewDate,
      this.createdAt,
      new Date(),
      updates.assignments !== undefined ? updates.assignments : this.assignments
    );
  }

  clone(): AliyaGroup {
    return new AliyaGroup(
      this.id,
      this.label,
      this.hebrewDate,
      this.createdAt,
      this.updatedAt,
      { ...this.assignments }
    );
  }

  // Helper methods for managing assignments
  getAssignedPrayerId(aliyaTypeId: string): string | undefined {
    return this.assignments[aliyaTypeId];
  }

  setAssignment(aliyaTypeId: string, prayerId: string): AliyaGroup {
    return this.update({
      assignments: {
        ...this.assignments,
        [aliyaTypeId]: prayerId,
      },
    });
  }

  removeAssignment(aliyaTypeId: string): AliyaGroup {
    const newAssignments = { ...this.assignments };
    delete newAssignments[aliyaTypeId];
    return this.update({
      assignments: newAssignments,
    });
  }

  clearAssignments(): AliyaGroup {
    return this.update({
      assignments: {},
    });
  }
}

// Mapper for the generic service
export const aliyaGroupMapper = {
  toDto: (aliyaGroup: AliyaGroup) => aliyaGroup.toDto(),
  fromDto: (dto: AliyaGroupDto) => AliyaGroup.fromDto(dto),
};
