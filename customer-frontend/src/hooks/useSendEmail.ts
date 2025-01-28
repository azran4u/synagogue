import { useMutation } from "@tanstack/react-query";
import { Email } from "../model/email";
import { emailService } from "../services/emailService";

export function useSendEmail() {
  const { mutate: sendEmail } = useMutation({
    mutationFn: async (email: Omit<Email, 'from'>) => {
      return emailService.insert({...email, from: "טייץ שומרון <app@shomron-tights.com>"});
    },
    retry: 3,
  });

  return { sendEmail };
}
