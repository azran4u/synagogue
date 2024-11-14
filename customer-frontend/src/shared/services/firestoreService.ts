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
} from "firebase/firestore";
import { firestoreDatabase } from "./firebase-config";

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
    return this.documentSnapshotToObject(docSnap);
  }

  public async getByQuery(
    queryWhere: QueryFieldFilterConstraint
  ): Promise<T[]> {
    const q = query(this.collectionRef, queryWhere);
    const querySnapshot = await getDocs(q);
    const data = this.querySnapshotToObject(querySnapshot);
    return data;
  }

  public async insert(document: Omit<T, "id">) {
    const doc = await addDoc(this.collectionRef, document);
    return doc.id;
  }

  public async update(id: string, document: Partial<T>) {
    await updateDoc<DocumentData>(this.docById(id), document);
  }

  public async liveQuery(cb: (arr: T[]) => void) {
    const q = query(this.collectionRef);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const res: T[] = this.querySnapshotToObject(querySnapshot);
      cb(res);
    });
    return unsubscribe;
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
    return querySnapshot.docs.map((doc) => this.documentSnapshotToObject(doc));
  }

  private documentSnapshotToObject(
    documentSnapshot: DocumentSnapshot<DocumentData>
  ) {
    return {
      ...documentSnapshot.data(),
      id: documentSnapshot.id,
    } as unknown as T;
  }
}
