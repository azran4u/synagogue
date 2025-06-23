export interface AppSettings {
  id: string;
  gabayimEmails: string[];
  synagogueName: string;
  synagogueAddress: string;
  contactPhone?: string;
  contactEmail?: string;
  updatedAt: Date;
  updatedBy: string;
}
