import { HebrewDate } from "./HebrewDate";
import { v4 as uuidv4 } from "uuid";
import { HebrewDateDto } from "./HebrewDate";

export interface AliyaGroupDto {
  id: string;
  label: string;
  hebrewDate: HebrewDateDto;
  createdAt: string;
  updatedAt: string;
}

export class AliyaGroup {
  public id: string;
  public label: string;
  public hebrewDate: HebrewDate;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    label: string,
    hebrewDate: HebrewDate,
    createdAt: Date,
    updatedAt: Date
  ) {
    this.id = id;
    this.label = label;
    this.hebrewDate = hebrewDate;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toDto(): AliyaGroupDto {
    return {
      id: this.id,
      label: this.label,
      hebrewDate: this.hebrewDate.toDto(),
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  static fromDto(dto: AliyaGroupDto): AliyaGroup {
    return new AliyaGroup(
      dto.id,
      dto.label,
      HebrewDate.fromDto(dto.hebrewDate),
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  static create(label: string, hebrewDate: HebrewDate): AliyaGroup {
    const now = new Date();
    const id = uuidv4();

    return new AliyaGroup(id, label, hebrewDate, now, now);
  }

  update(
    updates: Partial<Pick<AliyaGroup, "label" | "hebrewDate">>
  ): AliyaGroup {
    return new AliyaGroup(
      this.id,
      updates.label ?? this.label,
      updates.hebrewDate ?? this.hebrewDate,
      this.createdAt,
      new Date()
    );
  }

  clone(): AliyaGroup {
    return new AliyaGroup(
      this.id,
      this.label,
      this.hebrewDate,
      this.createdAt,
      this.updatedAt
    );
  }
}

// Mapper for the generic service
export const aliyaGroupMapper = {
  toDto: (aliyaGroup: AliyaGroup) => aliyaGroup.toDto(),
  fromDto: (dto: AliyaGroupDto) => AliyaGroup.fromDto(dto),
};
