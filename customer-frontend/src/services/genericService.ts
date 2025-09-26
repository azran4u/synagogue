import { DocumentData, WithFieldValue } from "firebase/firestore";
import { FirestoreService } from "./firestoreService";

export interface Mapper<T, D extends WithFieldValue<DocumentData>> {
  fromDto(dto: D, id: string): T;
  toDto(entity: T): D;
}

export class GenericService<T, D extends WithFieldValue<DocumentData>> {
  private mapper: Mapper<T, D>;
  private firebaseService: FirestoreService<D>;
  private synagogueId?: string;

  constructor(
    collectionName: string,
    mapper: Mapper<T, D>,
    synagogueId?: string
  ) {
    this.synagogueId = synagogueId;
    this.mapper = mapper;
    const collectionNameWithSynagogueId = this.synagogueId
      ? `/synagogues/${this.synagogueId}/${collectionName}`
      : collectionName;
    this.firebaseService = new FirestoreService<D>(
      collectionNameWithSynagogueId
    );
  }

  // Get all prayer times
  public async getAll(): Promise<T[]> {
    const dtos = await this.firebaseService.getAll();
    return dtos.map(dto => this.mapper.fromDto(dto, dto.id));
  }

  public async getById(id?: string | null): Promise<T | null> {
    if (!id) {
      return null;
    }
    const dto = await this.firebaseService.getById(id);
    if (!dto) {
      return null;
    }
    return this.mapper.fromDto(dto, dto.id);
  }

  public async isExists(id: string): Promise<boolean> {
    return this.firebaseService.isExists(id);
  }

  public async getByQuery(queryWhere: any): Promise<T[]> {
    const dtos = await this.firebaseService.getByQuery(queryWhere);
    return dtos.map(dto => this.mapper.fromDto(dto, dto.id));
  }

  public async insert(entity: T): Promise<string> {
    return this.firebaseService.insert(this.mapper.toDto(entity));
  }

  public async update(id: string, entity: T): Promise<void> {
    await this.firebaseService.update(id, this.mapper.toDto(entity));
  }

  public async deleteById(id: string): Promise<void> {
    await this.firebaseService.deleteById(id);
  }

  public async insertWithId(id: string, entity: T): Promise<string> {
    return this.firebaseService.insertWithId(id, this.mapper.toDto(entity));
  }
}

// Export singleton instance
