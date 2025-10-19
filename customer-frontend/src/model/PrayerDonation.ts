import { v4 as uuidv4 } from "uuid";
import { HebrewDate, HebrewDateDto } from "./HebrewDate";

// DTO interface for Firestore serialization
export interface PrayerDonationDto {
  id: string;
  amount: number;
  hebrewDate: HebrewDateDto;
  paid: boolean;
  notes?: string;
  createdAt: number;
  createdBy: string;
}

export class PrayerDonation {
  public id: string;
  public amount: number;
  public hebrewDate: HebrewDate;
  public paid: boolean;
  public notes?: string;
  public createdAt: Date;
  public createdBy: string;

  constructor(
    id: string,
    amount: number,
    hebrewDate: HebrewDate,
    paid: boolean,
    createdAt: Date,
    createdBy: string,
    notes?: string
  ) {
    this.id = id;
    this.amount = amount;
    this.hebrewDate = hebrewDate;
    this.paid = paid;
    this.notes = notes;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerDonationDto {
    return {
      id: this.id,
      amount: this.amount,
      hebrewDate: this.hebrewDate.toDto(),
      paid: this.paid,
      notes: this.notes,
      createdAt: this.createdAt.getTime(),
      createdBy: this.createdBy,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: PrayerDonationDto): PrayerDonation {
    return new PrayerDonation(
      dto.id,
      dto.amount,
      HebrewDate.fromDto(dto.hebrewDate),
      dto.paid,
      new Date(dto.createdAt),
      dto.createdBy,
      dto.notes
    );
  }

  // Create a new donation
  static create(
    amount: number,
    hebrewDate: HebrewDate,
    createdBy: string,
    paid: boolean = false,
    notes?: string
  ): PrayerDonation {
    return new PrayerDonation(
      uuidv4(),
      amount,
      hebrewDate,
      paid,
      new Date(),
      createdBy,
      notes
    );
  }

  // Update donation with new values
  update(
    updates: Partial<Omit<PrayerDonation, "id" | "createdAt" | "createdBy">>
  ): PrayerDonation {
    return new PrayerDonation(
      this.id,
      updates.amount ?? this.amount,
      updates.hebrewDate ?? this.hebrewDate,
      updates.paid ?? this.paid,
      this.createdAt,
      this.createdBy,
      updates.notes ?? this.notes
    );
  }

  // Mark donation as paid
  markAsPaid(): PrayerDonation {
    return new PrayerDonation(
      this.id,
      this.amount,
      this.hebrewDate,
      true,
      this.createdAt,
      this.createdBy,
      this.notes
    );
  }

  // Mark donation as unpaid
  markAsUnpaid(): PrayerDonation {
    return new PrayerDonation(
      this.id,
      this.amount,
      this.hebrewDate,
      false,
      this.createdAt,
      this.createdBy,
      this.notes
    );
  }

  // Getters
  get isPaid(): boolean {
    return this.paid;
  }

  get formattedAmount(): string {
    return `₪${this.amount.toLocaleString("he-IL")}`;
  }

  get isOverdue(): boolean {
    if (this.paid) return false;
    const thirtyDaysAgo = HebrewDate.fromGregorianDate(new Date()).subtractDays(
      30
    );
    return this.hebrewDate.toGregorianDate() < thirtyDaysAgo.toGregorianDate();
  }
}
