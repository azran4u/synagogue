import { PrayerCard, PrayerCardDto } from "../model/PrayerCard";
import { FirestoreService } from "./firestoreService";

export class PrayerCardsFirebaseService extends FirestoreService<PrayerCardDto> {
  constructor() {
    super("/prayerCards");
  }
}

export class PrayerCardsService {
  private service: PrayerCardsFirebaseService;

  constructor() {
    this.service = new PrayerCardsFirebaseService();
  }

  // Override methods to handle DTO conversion
  public async getAll(): Promise<PrayerCard[]> {
    const dtos = await this.service.getAll();
    return dtos.map(dto => PrayerCard.fromDto(dto));
  }

  public async getById(id: string): Promise<PrayerCard> {
    const dto = await this.service.getById(id);
    return PrayerCard.fromDto(dto);
  }

  public async getByQuery(queryWhere: any): Promise<PrayerCard[]> {
    const dtos = await this.service.getByQuery(queryWhere);
    return dtos.map(dto => PrayerCard.fromDto(dto));
  }

  public async insertWithId(prayerCard: PrayerCard): Promise<string> {
    const dto = prayerCard.toDto();
    return this.service.insertWithId(dto.id, dto);
  }

  public async insert(prayerCard: Omit<PrayerCard, "id">): Promise<string> {
    const dto = PrayerCard.create(
      prayerCard.prayer,
      prayerCard.events,
      prayerCard.children,
      prayerCard.email,
      prayerCard.createdAt,
      prayerCard.updatedAt
    ).toDto();
    return this.service.insert(dto);
  }

  public async update(
    id: string,
    prayerCard: Partial<PrayerCard>
  ): Promise<void> {
    const currentPrayerCard = await this.getById(id);
    const dto = PrayerCard.create(
      prayerCard.prayer ? prayerCard.prayer : currentPrayerCard.prayer,
      prayerCard.events ? prayerCard.events : currentPrayerCard.events,
      prayerCard.children ? prayerCard.children : currentPrayerCard.children,
      prayerCard.email ? prayerCard.email : currentPrayerCard.email,
      prayerCard.createdAt ? prayerCard.createdAt : currentPrayerCard.createdAt,
      prayerCard.updatedAt ? prayerCard.updatedAt : currentPrayerCard.updatedAt
    ).toDto();
    return this.service.update(id, dto);
  }

  public async deleteById(id: string): Promise<void> {
    return this.service.deleteById(id);
  }
}

export const prayerCardsSrevice = new PrayerCardsService();
