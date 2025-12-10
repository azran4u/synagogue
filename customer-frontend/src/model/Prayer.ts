import { HebrewDate, HebrewDateDto } from "./HebrewDate";
import { PrayerEvent, PrayerEventDto } from "./PrayerEvent";
import { PrayerDonation, PrayerDonationDto } from "./PrayerDonation";
import { Mapper } from "../services/genericService";
import { v4 as uuidv4 } from "uuid";
// DTO interface for Firestore serialization

export interface PrayerDto {
  id: string;
  firstName: string;
  lastName: string;
  hebrewBirthDate?: HebrewDateDto;
  phoneNumber?: string;
  email?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  events: PrayerEventDto[];
  donations: PrayerDonationDto[];
}

export interface PrayerCardDto {
  id: string;
  prayer: PrayerDto;
  children: PrayerDto[];
}

export class PrayerCard {
  public id: string;
  public prayer: Prayer;
  public children: Prayer[];

  constructor(id: string, prayer: Prayer, children: Prayer[]) {
    this.id = id;
    this.prayer = prayer;
    this.children = children;
  }

  toDto(): PrayerCardDto {
    return {
      id: this.id,
      prayer: this.prayer.toDto(),
      children: this.children.map(child => child.toDto()),
    };
  }

  static fromDto(dto: PrayerCardDto): PrayerCard {
    try {
      return new PrayerCard(
        dto.id,
        Prayer.fromDto(dto.prayer),
        dto.children.map(child => Prayer.fromDto(child))
      );
    } catch (error) {
      console.error("Error creating prayer card from DTO:", error, dto);
      throw error;
    }
  }

  static create(prayer: Prayer, children: Prayer[]): PrayerCard {
    return new PrayerCard(prayer.id, prayer, children);
  }
}

export class Prayer {
  public id: string;
  public firstName: string;
  public lastName: string;
  public hebrewBirthDate?: HebrewDate;
  public phoneNumber?: string;
  public email?: string;
  public notes?: string;
  public events: PrayerEvent[];
  public donations: PrayerDonation[];
  public createdAt: Date;
  public updatedAt: Date;

  constructor(
    id: string,
    firstName: string,
    lastName: string,
    hebrewBirthDate?: HebrewDate,
    phoneNumber?: string,
    email?: string,
    notes?: string,
    events: PrayerEvent[] = [],
    donations: PrayerDonation[] = [],
    createdAt: Date = new Date(),
    updatedAt: Date = new Date()
  ) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.hebrewBirthDate = hebrewBirthDate;
    this.phoneNumber = phoneNumber;
    this.email = email;
    this.notes = notes;
    this.events = events;
    this.donations = donations;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Convert to DTO for Firestore storage
  toDto(): PrayerDto {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      hebrewBirthDate: this.hebrewBirthDate?.toDto(),
      phoneNumber: this.phoneNumber,
      email: this.email,
      notes: this.notes,
      events: this.events.map(event => event.toDto()),
      donations: this.donations.map(donation => donation.toDto()),
      createdAt: this.createdAt.getTime(),
      updatedAt: this.updatedAt.getTime(),
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: PrayerDto): Prayer {
    return new Prayer(
      dto.id,
      dto.firstName,
      dto.lastName,
      dto.hebrewBirthDate ? HebrewDate.fromDto(dto.hebrewBirthDate) : undefined,
      dto.phoneNumber,
      dto.email,
      dto.notes,
      dto.events.map(eventDto => PrayerEvent.fromDto(eventDto)),
      dto.donations
        ? dto.donations.map(donationDto => PrayerDonation.fromDto(donationDto))
        : [],
      new Date(dto.createdAt),
      new Date(dto.updatedAt)
    );
  }

  // Create a new Prayer without ID (for creation)
  static create(
    firstName: string,
    lastName: string,
    hebrewBirthDate?: HebrewDate,
    phoneNumber?: string,
    email?: string,
    notes?: string,
    events?: PrayerEvent[],
    donations?: PrayerDonation[]
  ): Prayer {
    return new Prayer(
      uuidv4(),
      firstName,
      lastName,
      hebrewBirthDate,
      phoneNumber,
      email,
      notes,
      events ?? [],
      donations ?? [],
      new Date(),
      new Date()
    );
  }

  // Update the prayer
  update(updates: Partial<Omit<Prayer, "id" | "createdAt">>): Prayer {
    return new Prayer(
      this.id,
      updates.firstName ?? this.firstName,
      updates.lastName ?? this.lastName,
      updates.hebrewBirthDate ?? this.hebrewBirthDate,
      updates.phoneNumber ?? this.phoneNumber,
      updates.email ?? this.email,
      updates.notes ?? this.notes,
      updates.events ?? this.events,
      updates.donations ?? this.donations,
      this.createdAt,
      new Date() // updatedAt
    );
  }

  // Get full name
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  // Add a prayer event
  addPrayerEvent(event: PrayerEvent): Prayer {
    const updatedEvents = [...this.events, event];
    return this.update({ events: updatedEvents });
  }

  // Remove a prayer event by index
  removePrayerEvent(index: number): Prayer {
    const updatedEvents = this.events.filter((_, i) => i !== index);
    return this.update({ events: updatedEvents });
  }

  // Check if prayer has notes
  get hasNotes(): boolean {
    return !!(this.notes && this.notes.trim().length > 0);
  }

  // Check if prayer has Hebrew birth date
  get hasHebrewBirthDate(): boolean {
    return !!this.hebrewBirthDate;
  }

  // Donation-related methods
  addDonation(donation: PrayerDonation): Prayer {
    const updatedDonations = [...this.donations, donation];
    return this.update({ donations: updatedDonations });
  }

  updateDonation(
    donationId: string,
    updates: Partial<Omit<PrayerDonation, "id" | "createdAt" | "createdBy">>
  ): Prayer {
    const updatedDonations = this.donations.map(donation =>
      donation.id === donationId ? donation.update(updates) : donation
    );
    return this.update({ donations: updatedDonations });
  }

  removeDonation(donationId: string): Prayer {
    const updatedDonations = this.donations.filter(
      donation => donation.id !== donationId
    );
    return this.update({ donations: updatedDonations });
  }

  get unpaidDonations(): PrayerDonation[] {
    return this.donations.filter(donation => !donation.paid);
  }

  get paidDonations(): PrayerDonation[] {
    return this.donations.filter(donation => donation.paid);
  }

  get totalUnpaidAmount(): number {
    return this.unpaidDonations.reduce(
      (sum, donation) => sum + donation.amount,
      0
    );
  }
}

export const prayerMapper: Mapper<Prayer, PrayerDto> = {
  fromDto: Prayer.fromDto,
  toDto: (entity: Prayer) => entity.toDto(),
};

export const prayerCardMapper: Mapper<PrayerCard, PrayerCardDto> = {
  fromDto: PrayerCard.fromDto,
  toDto: (entity: PrayerCard) => entity.toDto(),
};
