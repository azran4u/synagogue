export interface Email {
  to: string;
  message: {
    subject: string;
    html: string;
  };
}
