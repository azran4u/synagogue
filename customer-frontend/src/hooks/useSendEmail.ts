import { useMutation } from "@tanstack/react-query";
import { Email } from "../model/email";
import { emailService } from "../services/emailService";

export function useSendEmail() {
  const { mutate: sendEmail } = useMutation({
    mutationFn: async (input: {
      email: Omit<Email, "from">;
      metadata?: Record<string, any>;
    }) => {
      return emailService.insert({
        ...input.email,
        ...input.metadata,
        from: "טייץ שומרון <app@shomron-tights.com>",
      });
    },
    retry: 3,
  });

  return { sendEmail };
}
