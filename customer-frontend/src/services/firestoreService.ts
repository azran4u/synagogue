import {
  CollectionReference,
  Firestore,
  collection,
  getDocs,
  query,
  DocumentData,
  QuerySnapshot,
  QueryFieldFilterConstraint,
  addDoc,
  WithFieldValue,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  DocumentSnapshot,
  runTransaction,
  Transaction,
  deleteDoc,
  setDoc,
  getCountFromServer,
} from "firebase/firestore";
import { firestoreDatabase } from "./firebaseConfig";

export interface FirebaseEntity extends Object {
  id: string;
}

export class FirestoreService<T extends WithFieldValue<DocumentData>> {
  protected db: Firestore;
  protected collectionRef: CollectionReference<DocumentData>;

  constructor(protected collectionName: string) {
    this.db = firestoreDatabase;
    this.collectionRef = collection(this.db, this.collectionName);
  }

  public async getAll(): Promise<T[]> {
    const docs = await getDocs(this.collectionRef);
    return this.querySnapshotToObject(docs);
  }

  public async getById(id: string) {
    const docSnap = await getDoc(this.docById(id));
    if (!docSnap.exists()) {
      console.error(
        `Document ${id} not found in collection ${this.collectionName}`
      );
      throw new Error(
        `Document ${id} not found in collection ${this.collectionName}`
      );
    }
    const data = this.documentSnapshotToObject(docSnap);
    if (!data) {
      console.error(
        `Document ${id} is empty in collection ${this.collectionName}`
      );
      throw new Error(
        `Document ${id} is empty in collection ${this.collectionName}`
      );
    }
    return data;
  }

  public async isExists(id: string) {
    const docSnap = await getDoc(this.docById(id));
    return docSnap.exists();
  }

  public async getByQuery(
    queryWhere: QueryFieldFilterConstraint
  ): Promise<T[]> {
    const q = query(this.collectionRef, queryWhere);
    const querySnapshot = await getDocs(q);
    const data = this.querySnapshotToObject(querySnapshot);
    return data;
  }

  public async insertWithId(id: string, document: Omit<T, "id">) {
    const sanitizedDocument = this.replaceUndefinedWithNull(document);
    await setDoc(this.docById(id), sanitizedDocument);
    return id;
  }

  public async insert(document: Omit<T, "id">) {
    const sanitizedDocument = this.replaceUndefinedWithNull(document);
    const doc = await addDoc(this.collectionRef, sanitizedDocument);
    return doc.id;
  }

  public async insertWithTimeout(document: Omit<T, "id">, timeout: number) {
    return this.withTimeout(this.insert(document), timeout);
  }

  public async update(id: string, document: Partial<T>) {
    const sanitizedDocument = this.replaceUndefinedWithNull(document);
    await updateDoc<any, DocumentData>(this.docById(id), sanitizedDocument);
  }

  public async liveQuery(cb: (arr: T[]) => void) {
    const q = query(this.collectionRef);
    const unsubscribe = onSnapshot(q, querySnapshot => {
      const res: T[] = this.querySnapshotToObject(querySnapshot);
      cb(res);
    });
    return unsubscribe;
  }

  public async countDocuments(): Promise<number> {
    const q = query(this.collectionRef);
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  }

  public async deleteById(id: string) {
    return deleteDoc(this.docById(id));
  }

  public async transaction<T>(fn: (transaction: Transaction) => Promise<T>) {
    await runTransaction(this.db, fn);
  }

  protected docById(id: string) {
    return doc(this.db, this.collectionName, id);
  }

  private querySnapshotToObject(querySnapshot: QuerySnapshot<DocumentData>) {
    return querySnapshot.docs.map(doc => this.documentSnapshotToObject(doc));
  }

  private documentSnapshotToObject(
    documentSnapshot: DocumentSnapshot<DocumentData>
  ) {
    return {
      ...documentSnapshot.data(),
      id: documentSnapshot.id,
    } as unknown as T;
  }

  private withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out")), timeout)
      ),
    ]);
  }

  /**
   * Recursively replaces all undefined values with null
   * This prevents Firestore errors when undefined values are sent
   */
  private replaceUndefinedWithNull(obj: any): any {
    if (obj === undefined) {
      return null;
    }
    if (obj === null) {
      return null;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.replaceUndefinedWithNull(item));
    }
    if (typeof obj === "object" && obj !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.replaceUndefinedWithNull(value);
      }
      return result;
    }
    return obj;
  }
}
