import { useMutation } from "@tanstack/react-query";
import { PrayerCard } from "../model/PrayerCard";
import { prayerCardsSrevice } from "../services/prayerCardsSrevice";
import { useAuth } from "./useAuth";

export function useAddPrayerCard() {
    const { user } = useAuth();
    const { mutate: addPrayerCard } = useMutation({
      mutationFn: async (input: {
        card: PrayerCard;
      }) => {
        if(user?.uid){
            return prayerCardsSrevice.insertWithId(user.uid, input.card);
        }else throw new Error("User not found");
      },
      retry: 3,
    });
  
    return { addPrayerCard };
  }