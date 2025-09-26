import { v4 as uuidv4 } from "uuid";
import { Mapper } from "../services/genericService";
import { UserRole } from "./UserRole";

// DTO interface for Firestore serialization
export interface MembershipDto {
  id: string;
  role: UserRole;
  familyId: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export class Membership {
  public id: string;
  public role: UserRole;
  public familyId: string;
  public enabled: boolean;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    role: UserRole,
    familyId: string,
    enabled: boolean = true,
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.role = role;
    this.familyId = familyId;
    this.enabled = enabled;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): MembershipDto {
    return {
      id: this.id,
      role: this.role,
      familyId: this.familyId,
      enabled: this.enabled,
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: MembershipDto): Membership {
    return new Membership(
      dto.id,
      dto.role,
      dto.familyId,
      dto.enabled,
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new Membership without ID (for creation)
  static create(
    role: UserRole,
    familyId: string,
    enabled: boolean = true
  ): Membership {
    return new Membership(
      uuidv4(),
      role,
      familyId,
      enabled,
      new Date(),
      new Date()
    );
  }

  // Update the membership
  update(updates: Partial<Omit<Membership, "id" | "createdAt">>): Membership {
    return new Membership(
      this.id,
      updates.role ?? this.role,
      updates.familyId ?? this.familyId,
      updates.enabled ?? this.enabled,
      this.createdAt,
      new Date()
    );
  }

  // Enable the membership
  enable(): Membership {
    return this.update({ enabled: true });
  }

  // Disable the membership
  disable(): Membership {
    return this.update({ enabled: false });
  }

  // Change role
  changeRole(newRole: UserRole): Membership {
    return this.update({ role: newRole });
  }

  // Check if membership is active
  get isActive(): boolean {
    return this.enabled;
  }

  // Check if user is admin
  get isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  // Check if user is gabbai or admin
  get isGabbaiOrHigher(): boolean {
    return this.role === UserRole.GABBAI || this.role === UserRole.ADMIN;
  }

  // Check if user is member
  get isMember(): boolean {
    return this.role === UserRole.MEMBER;
  }

  // Get role display name
  get roleDisplayName(): string {
    switch (this.role) {
      case UserRole.MEMBER:
        return "חבר";
      case UserRole.GABBAI:
        return "גבאי";
      case UserRole.ADMIN:
        return "מנהל";
      default:
        return "לא ידוע";
    }
  }
}

export const membershipMapper: Mapper<Membership, MembershipDto> = {
  fromDto: Membership.fromDto,
  toDto: (entity: Membership) => entity.toDto(),
};
