import { DocumentData, WithFieldValue } from "firebase/firestore";
import { FirestoreService } from "./firestoreService";

export interface Mapper<T, D extends WithFieldValue<DocumentData>> {
  fromDto(dto: D): T;
  toDto(entity: T): D;
}

export class GenericService<T, D extends WithFieldValue<DocumentData>> {
  private mapper: Mapper<T, D>;
  private firebaseService: FirestoreService<D>;

  constructor(collectionName: string, mapper: Mapper<T, D>) {
    this.mapper = mapper;
    this.firebaseService = new FirestoreService<D>(collectionName);
  }

  // Get all prayer times
  public async getAll(): Promise<T[]> {
    const dtos = await this.firebaseService.getAll();
    return dtos.map(dto => this.mapper.fromDto(dto));
  }

  public async getById(id: string): Promise<T> {
    const dto = await this.firebaseService.getById(id);
    return this.mapper.fromDto(dto);
  }

  public async getByQuery(queryWhere: any): Promise<T[]> {
    const dtos = await this.firebaseService.getByQuery(queryWhere);
    return dtos.map(dto => this.mapper.fromDto(dto));
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
