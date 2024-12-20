import { initDB } from "./initializeIndexedDb";

// Get all unsynced data from a store
export const markAsSynced = async (storeName,id) => {
    const db = await initDB();
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    
    // returns object that matches the id
    const record = await store.get(id);
    if (record) {
        record.sync_status = 1; // Update sync status
        await store.put(record);
    }

    await tx.done;
};