import { useMutation } from "@tanstack/react-query";
import { Email } from "../model/email";
import { emailService } from "../services/emailService";

export function useSendEmail() {
  const { mutate: sendEmail } = useMutation({
    mutationFn: async (email: Email) => {
      return emailService.insert(email);
    },
    retry: 3,
  });

  return { sendEmail };
}
