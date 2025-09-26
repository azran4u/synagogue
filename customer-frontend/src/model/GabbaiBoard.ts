import { Mapper } from "../services/genericService";
import { v4 as uuidv4 } from "uuid";

// DTO interface for Firestore serialization
export interface GabbaiBoardDto {
  id: string;
  lookaheadDays: number;
  updatedAt: number;
  updatedBy: string;
}

export class GabbaiBoard {
  public id: string;
  public lookaheadDays: number;
  public updatedAt: Date;
  public updatedBy: string;

  constructor(
    id: string,
    lookaheadDays: number = 14,
    updatedBy: string,
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.lookaheadDays = lookaheadDays;
    this.updatedBy = updatedBy;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): GabbaiBoardDto {
    return {
      id: this.id,
      lookaheadDays: this.lookaheadDays,
      updatedAt: this.updatedAt.getTime(),
      updatedBy: this.updatedBy,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: GabbaiBoardDto): GabbaiBoard {
    return new GabbaiBoard(
      dto.id,
      dto.lookaheadDays,
      dto.updatedBy,
      new Date(dto.updatedAt)
    );
  }

  // Create a new GabbaiBoard without ID (for creation)
  static create(updatedBy: string, lookaheadDays: number = 14): GabbaiBoard {
    return new GabbaiBoard(uuidv4(), lookaheadDays, updatedBy, new Date());
  }

  // Update the gabbai board
  update(
    updates: Partial<Omit<GabbaiBoard, "updatedAt" | "updatedBy">>,
    updatedBy: string
  ): GabbaiBoard {
    return new GabbaiBoard(
      this.id,
      updates.lookaheadDays ?? this.lookaheadDays,
      updatedBy,
      new Date()
    );
  }

  // Update lookahead days
  updateLookaheadDays(lookaheadDays: number, updatedBy: string): GabbaiBoard {
    return this.update({ lookaheadDays }, updatedBy);
  }

  // Check if lookahead days is valid (positive number)
  get isValidLookaheadDays(): boolean {
    return this.lookaheadDays > 0 && Number.isInteger(this.lookaheadDays);
  }

  // Get lookahead days description
  get lookaheadDaysDescription(): string {
    return `${this.lookaheadDays} ימים`;
  }

  // Get formatted update time
  get formattedUpdatedAt(): string {
    return this.updatedAt.toLocaleDateString("he-IL");
  }

  // Clone the gabbai board
  clone(): GabbaiBoard {
    return new GabbaiBoard(
      this.id,
      this.lookaheadDays,
      this.updatedBy,
      this.updatedAt
    );
  }
}

export const gabbaiBoardMapper: Mapper<GabbaiBoard, GabbaiBoardDto> = {
  fromDto: GabbaiBoard.fromDto,
  toDto: (entity: GabbaiBoard) => entity.toDto(),
};
