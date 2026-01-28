import { openDB } from 'idb';

const DB_NAME = 'resik-artha-db';
const DB_VERSION = 1;

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('offline-data')) {
                db.createObjectStore('offline-data', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('pending-sync')) {
                db.createObjectStore('pending-sync', { autoIncrement: true });
            }
        },
    });
};

export const saveData = async <T = unknown>(storeName: string, data: T) => {
    const db = await initDB();
    return db.put(storeName, data);
};

export const getData = async <T = unknown>(storeName: string, id: string): Promise<T | undefined> => {
    const db = await initDB();
    return db.get(storeName, id);
};

export const getAllData = async <T = unknown>(storeName: string): Promise<T[]> => {
    const db = await initDB();
    return db.getAll(storeName);
};

export const deleteData = async (storeName: string, id: string) => {
    const db = await initDB();
    return db.delete(storeName, id);
};
