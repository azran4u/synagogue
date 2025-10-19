import { v4 as uuidv4 } from "uuid";
import { Mapper } from "../services/genericService";

// DTO interface for Firestore serialization
export interface DonationDto {
  id: string;
  title: string;
  link?: string;
  notes?: string;
  enabled: boolean;
  displayOrder: number;
  createdAt: number;
  createdBy: string;
}

export class Donation {
  public id: string;
  public title: string;
  public link?: string;
  public notes?: string;
  public enabled: boolean;
  public displayOrder: number;
  public createdAt: Date;
  public createdBy: string;

  constructor(
    id: string,
    title: string,
    link: string | undefined,
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
    link: string | undefined,
    createdBy: string,
    displayOrder: number = 1,
    enabled: boolean = true,
    notes?: string
  ): Donation {
    return new Donation(
      uuidv4(),
      title,
      link,
      createdBy,
      enabled,
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
      "link" in updates ? updates.link : this.link,
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
  updateLink(newLink: string | undefined): Donation {
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

  // Check if donation has a link
  get hasLink(): boolean {
    return !!(this.link && this.link.trim().length > 0);
  }

  // Check if donation link is valid (basic URL check)
  get hasValidLink(): boolean {
    if (!this.hasLink) {
      return false;
    }
    try {
      new URL(this.link!);
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
    if (!this.hasLink) {
      return "No Link";
    }
    try {
      const url = new URL(this.link!);
      return url.hostname;
    } catch {
      return "Invalid URL";
    }
  }

  // Check if link is PayBox
  get isPayBoxLink(): boolean {
    if (!this.hasLink) return false;
    return this.linkDomain.toLowerCase().includes("paybox");
  }

  // Check if link is external payment service
  get isExternalPayment(): boolean {
    if (!this.hasLink) return false;
    const domain = this.linkDomain.toLowerCase();
    return (
      domain.includes("paybox") ||
      domain.includes("paypal") ||
      domain.includes("bitpay")
    );
  }

  // Get payment service name
  get paymentServiceName(): string {
    if (!this.hasLink) return "העברה בנקאית";
    const domain = this.linkDomain.toLowerCase();
    if (domain.includes("paybox")) return "פייבוקס";
    if (domain.includes("paypal")) return "פייפאל";
    if (domain.includes("bitpay")) return "ביט";
    return "";
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
