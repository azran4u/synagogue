import { v4 as uuidv4 } from "uuid";
import { Mapper } from "../services/genericService";

// DTO interface for Firestore serialization
export interface DonationDto {
  id: string;
  title: string;
  link: string;
  notes?: string;
  enabled: boolean;
  displayOrder: number;
  createdAt: number;
  createdBy: string;
}

export class Donation {
  public id: string;
  public title: string;
  public link: string;
  public notes?: string;
  public enabled: boolean;
  public displayOrder: number;
  public createdAt: Date;
  public createdBy: string;

  constructor(
    id: string,
    title: string,
    link: string,
    createdBy: string,
    enabled: boolean = true,
    displayOrder: number = 1,
    notes?: string,
    createdAt: Date = new Date()
  ) {
    this.id = id;
    this.title = title;
    this.link = link;
    this.notes = notes;
    this.enabled = enabled;
    this.displayOrder = displayOrder;
    this.createdAt = createdAt;
    this.createdBy = createdBy;
  }

  // Convert to DTO for Firestore storage
  toDto(): DonationDto {
    return {
      id: this.id,
      title: this.title,
      link: this.link,
      notes: this.notes,
      enabled: this.enabled,
      displayOrder: this.displayOrder,
      createdAt: this.createdAt.getTime(),
      createdBy: this.createdBy,
    };
  }

  // Create from DTO from Firestore
  static fromDto(dto: DonationDto): Donation {
    return new Donation(
      dto.id,
      dto.title,
      dto.link,
      dto.createdBy,
      dto.enabled,
      dto.displayOrder,
      dto.notes,
      new Date(dto.createdAt)
    );
  }

  // Create a new Donation without ID (for creation)
  static create(
    title: string,
    link: string,
    createdBy: string,
    displayOrder: number = 1,
    notes?: string
  ): Donation {
    return new Donation(
      uuidv4(),
      title,
      link,
      createdBy,
      true, // enabled by default
      displayOrder,
      notes
    );
  }

  // Update the donation
  update(
    updates: Partial<Omit<Donation, "id" | "createdAt" | "createdBy">>
  ): Donation {
    return new Donation(
      this.id,
      updates.title ?? this.title,
      updates.link ?? this.link,
      this.createdBy,
      updates.enabled ?? this.enabled,
      updates.displayOrder ?? this.displayOrder,
      updates.notes ?? this.notes,
      this.createdAt
    );
  }

  // Enable the donation
  enable(): Donation {
    return this.update({ enabled: true });
  }

  // Disable the donation
  disable(): Donation {
    return this.update({ enabled: false });
  }

  // Update the donation link
  updateLink(newLink: string): Donation {
    return this.update({ link: newLink });
  }

  // Update the donation title
  updateTitle(newTitle: string): Donation {
    return this.update({ title: newTitle });
  }

  // Update the donation notes
  updateNotes(newNotes: string): Donation {
    return this.update({ notes: newNotes });
  }

  // Check if donation is enabled
  get isEnabled(): boolean {
    return this.enabled;
  }

  // Check if donation has notes
  get hasNotes(): boolean {
    return !!(this.notes && this.notes.trim().length > 0);
  }

  // Check if donation link is valid (basic URL check)
  get hasValidLink(): boolean {
    try {
      new URL(this.link);
      return true;
    } catch {
      return false;
    }
  }

  // Get donation age in days
  get ageInDays(): number {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - this.createdAt.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Check if donation is recent (within 30 days)
  get isRecent(): boolean {
    return this.ageInDays <= 30;
  }

  // Get notes preview (first 100 characters)
  get notesPreview(): string {
    if (!this.notes || this.notes.length <= 100) {
      return this.notes || "";
    }
    return this.notes.substring(0, 100) + "...";
  }

  // Get link domain (for display purposes)
  get linkDomain(): string {
    try {
      const url = new URL(this.link);
      return url.hostname;
    } catch {
      return "Invalid URL";
    }
  }

  // Check if link is PayBox
  get isPayBoxLink(): boolean {
    return this.linkDomain.toLowerCase().includes("paybox");
  }

  // Check if link is external payment service
  get isExternalPayment(): boolean {
    const domain = this.linkDomain.toLowerCase();
    return (
      domain.includes("paybox") ||
      domain.includes("paypal") ||
      domain.includes("stripe") ||
      domain.includes("square")
    );
  }

  // Get payment service name
  get paymentServiceName(): string {
    const domain = this.linkDomain.toLowerCase();
    if (domain.includes("paybox")) return "PayBox";
    if (domain.includes("paypal")) return "PayPal";
    if (domain.includes("stripe")) return "Stripe";
    if (domain.includes("square")) return "Square";
    return "Unknown";
  }

  // Clone the donation
  clone(): Donation {
    return new Donation(
      this.id,
      this.title,
      this.link,
      this.createdBy,
      this.enabled,
      this.displayOrder,
      this.notes,
      this.createdAt
    );
  }
}

export const donationMapper: Mapper<Donation, DonationDto> = {
  fromDto: Donation.fromDto,
  toDto: (entity: Donation) => entity.toDto(),
};
