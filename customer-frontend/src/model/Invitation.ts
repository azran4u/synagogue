import { DocumentData, WithFieldValue } from "firebase/firestore";

export interface InvitationDto {
  inviterUid: string;
  inviterName: string;
  familyId?: string;
  familyLabel?: string;
  inviteeRole: "member" | "gabbai" | "admin";
  uidToMigrate?: string;
  inviteeUid?: string;
  status: "pending" | "accepted" | "cancelled";
  createdAt: number;
  expiresAt?: number;
}

export class Invitation {
  public id: string;
  public inviterUid: string;
  public inviterName: string;
  public familyId?: string;
  public familyLabel?: string;
  public inviteeRole: "member" | "gabbai" | "admin";
  public uidToMigrate?: string;
  public inviteeUid?: string;
  public status: "pending" | "accepted" | "cancelled";
  public createdAt: Date;
  public expiresAt?: Date;

  constructor(
    id: string,
    inviterUid: string,
    inviterName: string,
    inviteeRole: "member" | "gabbai" | "admin",
    status: "pending" | "accepted" | "cancelled",
    createdAt: Date,
    familyId?: string,
    familyLabel?: string,
    uidToMigrate?: string,
    inviteeUid?: string,
    expiresAt?: Date
  ) {
    this.id = id;
    this.inviterUid = inviterUid;
    this.inviterName = inviterName;
    this.familyId = familyId;
    this.familyLabel = familyLabel;
    this.inviteeRole = inviteeRole;
    this.uidToMigrate = uidToMigrate;
    this.inviteeUid = inviteeUid;
    this.status = status;
    this.createdAt = createdAt;
    this.expiresAt = expiresAt;
  }

  toDto(): InvitationDto {
    return {
      inviterUid: this.inviterUid,
      inviterName: this.inviterName,
      familyId: this.familyId,
      familyLabel: this.familyLabel,
      inviteeRole: this.inviteeRole,
      uidToMigrate: this.uidToMigrate,
      inviteeUid: this.inviteeUid,
      status: this.status,
      createdAt: this.createdAt.getTime(),
      expiresAt: this.expiresAt?.getTime(),
    };
  }

  static fromDto(dto: InvitationDto, id: string): Invitation {
    return new Invitation(
      id,
      dto.inviterUid,
      dto.inviterName,
      dto.inviteeRole,
      dto.status,
      new Date(dto.createdAt),
      dto.familyId,
      dto.familyLabel,
      dto.uidToMigrate,
      dto.inviteeUid,
      dto.expiresAt ? new Date(dto.expiresAt) : undefined
    );
  }

  static create(
    id: string,
    inviterUid: string,
    inviterName: string,
    inviteeRole: "member" | "gabbai" | "admin",
    familyId?: string,
    familyLabel?: string,
    uidToMigrate?: string,
    expiresAt?: Date
  ): Invitation {
    return new Invitation(
      id,
      inviterUid,
      inviterName,
      inviteeRole,
      "pending",
      new Date(),
      familyId,
      familyLabel,
      uidToMigrate,
      undefined, // inviteeUid will be set when accepted
      expiresAt
    );
  }

  // Computed properties
  get isExpired(): boolean {
    return this.expiresAt ? this.expiresAt < new Date() : false;
  }

  get isPending(): boolean {
    return this.status === "pending" && !this.isExpired;
  }

  get invitationLink(): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/invitation/${this.id}`;
  }

  get formattedCreatedAt(): string {
    return this.createdAt.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  get formattedExpiresAt(): string | null {
    return this.expiresAt
      ? this.expiresAt.toLocaleDateString("he-IL", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : null;
  }

  get roleDisplayName(): string {
    switch (this.inviteeRole) {
      case "member":
        return "חבר";
      case "gabbai":
        return "גבאי";
      case "admin":
        return "מנהל";
      default:
        return this.inviteeRole;
    }
  }

  get statusDisplayName(): string {
    switch (this.status) {
      case "pending":
        return "ממתין";
      case "accepted":
        return "אושר";
      case "cancelled":
        return "בוטל";
      default:
        return this.status;
    }
  }
}

export const invitationMapper = {
  fromDto: (dto: InvitationDto, id: string): Invitation =>
    Invitation.fromDto(dto, id),
  toDto: (entity: Invitation): InvitationDto => entity.toDto(),
};
