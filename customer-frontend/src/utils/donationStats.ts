import { Prayer, PrayerCard } from "../model/Prayer";
import { PrayerDonation } from "../model/PrayerDonation";

export interface DonationWithContext {
  donation: PrayerDonation;
  prayer: Prayer;
  prayerCard: PrayerCard;
}

export const calculateTotalUnpaid = (prayers: Prayer[]): number => {
  return prayers.reduce((total, prayer) => {
    return total + prayer.totalUnpaidAmount;
  }, 0);
};

export const calculateTotalPaid = (prayers: Prayer[]): number => {
  return prayers.reduce((total, prayer) => {
    return (
      total +
      prayer.paidDonations.reduce((sum, donation) => sum + donation.amount, 0)
    );
  }, 0);
};

export const getPrayersWithUnpaidDonations = (prayers: Prayer[]): Prayer[] => {
  return prayers.filter(prayer => prayer.unpaidDonations.length > 0);
};

export const getUnpaidDonationsCount = (prayers: Prayer[]): number => {
  return prayers.reduce((count, prayer) => {
    return count + prayer.unpaidDonations.length;
  }, 0);
};

export const formatCurrency = (amount: number): string => {
  return `₪${amount.toLocaleString("he-IL")}`;
};

export const getAllDonationsWithPrayerContext = (
  prayerCards: PrayerCard[]
): DonationWithContext[] => {
  const donationsWithContext: DonationWithContext[] = [];

  prayerCards.forEach((prayerCard: PrayerCard) => {
    // Process main prayer
    prayerCard.prayer.donations.forEach((donation: PrayerDonation) => {
      donationsWithContext.push({
        donation,
        prayer: prayerCard.prayer,
        prayerCard,
      });
    });

    // Process children
    prayerCard.children.forEach((child: Prayer) => {
      child.donations.forEach((donation: PrayerDonation) => {
        donationsWithContext.push({
          donation,
          prayer: child,
          prayerCard,
        });
      });
    });
  });

  return donationsWithContext;
};

export const getAllPrayersFromCards = (prayerCards: PrayerCard[]): Prayer[] => {
  const prayers: Prayer[] = [];

  prayerCards.forEach((prayerCard: PrayerCard) => {
    prayers.push(prayerCard.prayer);
    prayers.push(...prayerCard.children);
  });

  return prayers;
};
