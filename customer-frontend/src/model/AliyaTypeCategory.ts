import { v4 as uuidv4 } from "uuid";
import { Mapper } from "../services/genericService";

// DTO interface for Firestore serialization
export interface AliyaTypeCategoryDto {
  id: string;
  name: string;
  description?: string;
  displayOrder?: number;
  aliyaTypeIds?: string[]; // Array of AliyaType IDs
  createdAt: number;
  updatedAt: number;
}

export class AliyaTypeCategory {
  public id: string;
  public name: string;
  public description?: string;
  public displayOrder?: number;
  public aliyaTypeIds: string[]; // Array of AliyaType IDs
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    name: string,
    description?: string,
    displayOrder?: number,
    aliyaTypeIds?: string[],
    createdAt?: Date,
    updatedAt?: Date
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.displayOrder = displayOrder;
    this.aliyaTypeIds = aliyaTypeIds || [];
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  // Convert to DTO for Firestore storage
  toDto(): AliyaTypeCategoryDto {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      displayOrder: this.displayOrder,
      aliyaTypeIds: this.aliyaTypeIds,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: AliyaTypeCategoryDto): AliyaTypeCategory {
    return new AliyaTypeCategory(
      dto.id,
      dto.name,
      dto.description,
      dto.displayOrder,
      dto.aliyaTypeIds,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new AliyaTypeCategory without ID (for creation)
  static create(
    name: string,
    description?: string,
    displayOrder?: number,
    aliyaTypeIds?: string[]
  ): AliyaTypeCategory {
    return new AliyaTypeCategory(
      uuidv4(),
      name,
      description,
      displayOrder,
      aliyaTypeIds
    );
  }

  // Update the category
  update(
    updates: Partial<Omit<AliyaTypeCategory, "id" | "createdAt">>
  ): AliyaTypeCategory {
    return new AliyaTypeCategory(
      this.id,
      updates.name ?? this.name,
      updates.description ?? this.description,
      updates.displayOrder ?? this.displayOrder,
      updates.aliyaTypeIds ?? this.aliyaTypeIds,
      this.createdAt,
      new Date() // Update updatedAt
    );
  }

  // Clone the category
  clone(): AliyaTypeCategory {
    return new AliyaTypeCategory(
      this.id,
      this.name,
      this.description,
      this.displayOrder,
      this.aliyaTypeIds,
      this.createdAt,
      this.updatedAt
    );
  }
}

// Mapper for Firestore service
const aliyaTypeCategoryMapper: Mapper<AliyaTypeCategory, AliyaTypeCategoryDto> =
  {
    fromDto: AliyaTypeCategory.fromDto,
    toDto: (entity: AliyaTypeCategory) => entity.toDto(),
  };

export { aliyaTypeCategoryMapper };
