import { useMemo } from "react";
import { PrayerCard } from "../model/Prayer";
import { PrayerDonation } from "../model/PrayerDonation";
import { usePrayerCard } from "./usePrayerCard";
import {
  getAllPrayersFromCards,
  getAllDonationsWithPrayerContext,
  DonationWithContext,
} from "../utils/donationStats";

export function useUnpaidDonationsForCurrentUser(): PrayerDonation[] {
  const { data: prayerCard, isLoading } = usePrayerCard();

  return useMemo(() => {
    if (!prayerCard || isLoading) {
      return [];
    }

    return prayerCard.prayer.unpaidDonations;
  }, [prayerCard, isLoading]);
}

export function useAllDonationsAcrossPrayers(
  prayerCards: PrayerCard[] | undefined
): DonationWithContext[] {
  return useMemo(() => {
    if (!prayerCards) {
      return [];
    }

    return getAllDonationsWithPrayerContext(prayerCards);
  }, [prayerCards]);
}

export function useDonationStatistics(prayerCards: PrayerCard[] | undefined) {
  return useMemo(() => {
    if (!prayerCards) {
      return {
        totalUnpaid: 0,
        totalPaid: 0,
        prayersWithUnpaidCount: 0,
        unpaidDonationsCount: 0,
      };
    }

    const allPrayers = getAllPrayersFromCards(prayerCards);
    const totalUnpaid = allPrayers.reduce(
      (sum, prayer) => sum + prayer.totalUnpaidAmount,
      0
    );
    const totalPaid = allPrayers.reduce((sum, prayer) => {
      return (
        sum +
        prayer.paidDonations.reduce(
          (donationSum, donation) => donationSum + donation.amount,
          0
        )
      );
    }, 0);
    const prayersWithUnpaidCount = allPrayers.filter(
      prayer => prayer.unpaidDonations.length > 0
    ).length;
    const unpaidDonationsCount = allPrayers.reduce(
      (count, prayer) => count + prayer.unpaidDonations.length,
      0
    );

    return {
      totalUnpaid,
      totalPaid,
      prayersWithUnpaidCount,
      unpaidDonationsCount,
    };
  }, [prayerCards]);
}
