from config import firestore_database_client


def delete_collection(collection_name, batch_size=100):
    print(f"Deleting collection: {collection_name}")
    collection_ref = firestore_database_client.collection(collection_name)

    def delete_batch(collection_ref):
        docs = collection_ref.limit(batch_size).stream()
        deleted = 0

        for doc in docs:
            doc.reference.delete()
            deleted += 1

        return deleted

    while True:
        deleted = delete_batch(collection_ref)
        if deleted == 0:
            break

    print(f"Collection '{collection_name}' deleted successfully")


def write_df_to_firestore(df, collection_name, id_column=None):

    # Reference to the Firestore collection
    collection_ref = firestore_database_client.collection(collection_name)

    # Write each row in the DataFrame to the Firestore collection
    for index, row in df.iterrows():
        if id_column and id_column in df.columns:
            doc_id = str(row[id_column])
        else:
            doc_id = str(index)
        doc_ref = collection_ref.document(doc_id)
        doc_ref.set(row.to_dict())


def read_firestore_collection(collection_name):
    print(f"Reading Firestore collection: {collection_name}")
    try:
        collection_ref = firestore_database_client.collection(collection_name)
        docs = collection_ref.stream()
        documents = []
        for doc in docs:
            doc_dict = doc.to_dict()
            doc_dict["_id"] = doc.id  # Include the document ID in the dictionary
            documents.append(doc_dict)
        return documents
    except Exception as e:
        print(f"Error reading Firestore collection: {e}")
        raise e
