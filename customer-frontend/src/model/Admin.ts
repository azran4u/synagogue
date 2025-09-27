import { GenericService, Mapper } from "../services/genericService";

// DTO interface for Firestore serialization
export interface AdminDto {}

export class Admin {
  public id: string; // email

  constructor(id: string) {
    this.id = id;
  }

  // Convert to DTO for Firestore storage
  toDto(): AdminDto {
    return {};
  }

  // Create from DTO from Firestore
  static fromDto(dto: AdminDto, id: string): Admin {
    return new Admin(id);
  }

  // Create a new Synagogue
  static create(id: string): Admin {
    return new Admin(id);
  }
}

export const adminMapper: Mapper<Admin, AdminDto> = {
  fromDto: (dto: AdminDto, id: string) => Admin.fromDto(dto, id),
  toDto: (entity: Admin) => entity.toDto(),
};
