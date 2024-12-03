export interface Email {
  to: string;
  from: string;
  message: {
    subject: string;
    html: string;
  };
}
