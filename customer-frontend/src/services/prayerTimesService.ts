import { PrayerTimes, PrayerTimesDto } from "../model/PrayerTimes";
import { FirestoreService } from "./firestoreService";

class PrayerTimesFirebaseService extends FirestoreService<PrayerTimesDto> {
  constructor() {
    super("/prayerTimes");
  }
}

class PrayerTimesService {
  private service: PrayerTimesFirebaseService;

  constructor() {
    this.service = new PrayerTimesFirebaseService();
  }

  // Get all prayer times
  public async getAll(): Promise<PrayerTimes[]> {
    const dtos = await this.service.getAll();
    return dtos.map(dto => PrayerTimes.fromDto(dto));
  }

  public async getById(id: string): Promise<PrayerTimes> {
    const dto = await this.service.getById(id);
    return PrayerTimes.fromDto(dto);
  }

  public async getByQuery(queryWhere: any): Promise<PrayerTimes[]> {
    const dtos = await this.service.getByQuery(queryWhere);
    return dtos.map(dto => PrayerTimes.fromDto(dto));
  }

  public async insert(prayerTimes: PrayerTimes): Promise<string> {
    return this.service.insert(prayerTimes.toDto());
  }

  public async update(id: string, prayerTimes: PrayerTimes): Promise<void> {
    await this.service.update(id, prayerTimes.toDto());
  }

  public async deleteById(id: string): Promise<void> {
    await this.service.deleteById(id);
  }

  public async insertWithId(
    id: string,
    prayerTimes: PrayerTimes
  ): Promise<void> {
    await this.service.insertWithId(id, prayerTimes.toDto());
  }
}

// Export singleton instance
export const prayerTimesService = new PrayerTimesService();
