export enum UserRole {
  REGULAR_PRAYER = "regular_prayer",
  GABAY = "gabay"
}

export interface User {
  uid: string;
  email: string;
  role: UserRole;
  prayerId?: string; // For regular prayers, links to their prayer card
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLoginAt: Date;
} 