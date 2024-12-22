import { initDB } from "./initializeIndexedDb";

export const deleteResourceFromIndexedDB = async (resourceId) => {
    const db = await initDB();
    const tx = db.transaction('resources', 'readwrite');
    const store = tx.objectStore('resources');
    await store.delete(resourceId);
    await tx.done;
    console.log(`Resource with ID ${resourceId} has been removed from IndexedDB.`);
  };