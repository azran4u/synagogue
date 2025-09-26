export enum UserRole {
  MEMBER = "member",
  GABBAI = "gabbai",
  ADMIN = "admin",
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
