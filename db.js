// Gestion de la base de données IndexedDB
class Database {
    constructor() {
        this.db = null;
        this.dbName = 'AGCoproprieteDB';
        this.dbVersion = 1;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store Copropriété
                if (!db.objectStoreNames.contains('copropriete')) {
                    const coproStore = db.createObjectStore('copropriete', { keyPath: 'id', autoIncrement: true });
                    coproStore.createIndex('name', 'name', { unique: false });
                }

                // Store Lots
                if (!db.objectStoreNames.contains('lots')) {
                    const lotsStore = db.createObjectStore('lots', { keyPath: 'id', autoIncrement: true });
                    lotsStore.createIndex('number', 'number', { unique: true });
                }

                // Store Assemblées
                if (!db.objectStoreNames.contains('assemblees')) {
                    const assembleesStore = db.createObjectStore('assemblees', { keyPath: 'id', autoIncrement: true });
                    assembleesStore.createIndex('date', 'date', { unique: false });
                }

                // Store Présences
                if (!db.objectStoreNames.contains('presences')) {
                    const presencesStore = db.createObjectStore('presences', { keyPath: 'id', autoIncrement: true });
                    presencesStore.createIndex('assembleeId', 'assembleeId', { unique: false });
                    presencesStore.createIndex('lotId', 'lotId', { unique: false });
                }

                // Store Procurations
                if (!db.objectStoreNames.contains('procurations')) {
                    const procurationsStore = db.createObjectStore('procurations', { keyPath: 'id', autoIncrement: true });
                    procurationsStore.createIndex('assembleeId', 'assembleeId', { unique: false });
                    procurationsStore.createIndex('mandantId', 'mandantId', { unique: false });
                }

                // Store Résolutions
                if (!db.objectStoreNames.contains('resolutions')) {
                    const resolutionsStore = db.createObjectStore('resolutions', { keyPath: 'id', autoIncrement: true });
                    resolutionsStore.createIndex('assembleeId', 'assembleeId', { unique: false });
                }

                // Store Votes
                if (!db.objectStoreNames.contains('votes')) {
                    const votesStore = db.createObjectStore('votes', { keyPath: 'id', autoIncrement: true });
                    votesStore.createIndex('resolutionId', 'resolutionId', { unique: false });
                    votesStore.createIndex('lotId', 'lotId', { unique: false });
                }
            };
        });
    }

    // Copropriété
    async getCopropriete() {
        const tx = this.db.transaction('copropriete', 'readonly');
        const store = tx.objectStore('copropriete');
        const request = store.getAll();
        return new Promise((resolve, reject) => {
            request.onsuccess = () => resolve(request.result[0] || null);
            request.onerror = () => reject(request.error);
        });
    }

    async saveCopropriete(data) {
        const tx = this.db.transaction('copropriete', 'readwrite');
        const store = tx.objectStore('copropriete');
        const existing = await this.getCopropriete();
        const dataToSave = { ...data, id: existing?.id || 1 };
        return new Promise((resolve, reject) => {
            const request = store.put(dataToSave);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Lots
    async getLots() {
        const tx = this.db.transaction('lots', 'readonly');
        const store = tx.objectStore('lots');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getLot(id) {
        const tx = this.db.transaction('lots', 'readonly');
        const store = tx.objectStore('lots');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveLot(lot) {
        const tx = this.db.transaction('lots', 'readwrite');
        const store = tx.objectStore('lots');
        return new Promise((resolve, reject) => {
            const request = lot.id ? store.put(lot) : store.add(lot);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteLot(id) {
        const tx = this.db.transaction('lots', 'readwrite');
        const store = tx.objectStore('lots');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Assemblées
    async getAssemblees() {
        const tx = this.db.transaction('assemblees', 'readonly');
        const store = tx.objectStore('assemblees');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result.sort((a, b) => new Date(b.date) - new Date(a.date)));
            request.onerror = () => reject(request.error);
        });
    }

    async getAssemblee(id) {
        const tx = this.db.transaction('assemblees', 'readonly');
        const store = tx.objectStore('assemblees');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveAssemblee(assemblee) {
        const tx = this.db.transaction('assemblees', 'readwrite');
        const store = tx.objectStore('assemblees');
        return new Promise((resolve, reject) => {
            const request = assemblee.id ? store.put(assemblee) : store.add(assemblee);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteAssemblee(id) {
        const tx = this.db.transaction('assemblees', 'readwrite');
        const store = tx.objectStore('assemblees');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Présences
    async getPresences(assembleeId) {
        const tx = this.db.transaction('presences', 'readonly');
        const store = tx.objectStore('presences');
        const index = store.index('assembleeId');
        return new Promise((resolve, reject) => {
            const request = index.getAll(assembleeId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async savePresence(presence) {
        const tx = this.db.transaction('presences', 'readwrite');
        const store = tx.objectStore('presences');
        return new Promise((resolve, reject) => {
            const request = presence.id ? store.put(presence) : store.add(presence);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deletePresence(id) {
        const tx = this.db.transaction('presences', 'readwrite');
        const store = tx.objectStore('presences');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Procurations
    async getProcurations(assembleeId) {
        const tx = this.db.transaction('procurations', 'readonly');
        const store = tx.objectStore('procurations');
        const index = store.index('assembleeId');
        return new Promise((resolve, reject) => {
            const request = index.getAll(assembleeId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveProcuration(procuration) {
        const tx = this.db.transaction('procurations', 'readwrite');
        const store = tx.objectStore('procurations');
        return new Promise((resolve, reject) => {
            const request = procuration.id ? store.put(procuration) : store.add(procuration);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteProcuration(id) {
        const tx = this.db.transaction('procurations', 'readwrite');
        const store = tx.objectStore('procurations');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Résolutions
    async getResolutions(assembleeId) {
        const tx = this.db.transaction('resolutions', 'readonly');
        const store = tx.objectStore('resolutions');
        const index = store.index('assembleeId');
        return new Promise((resolve, reject) => {
            const request = index.getAll(assembleeId);
            request.onsuccess = () => resolve(request.result.sort((a, b) => a.number - b.number));
            request.onerror = () => reject(request.error);
        });
    }

    async getResolution(id) {
        const tx = this.db.transaction('resolutions', 'readonly');
        const store = tx.objectStore('resolutions');
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveResolution(resolution) {
        const tx = this.db.transaction('resolutions', 'readwrite');
        const store = tx.objectStore('resolutions');
        return new Promise((resolve, reject) => {
            const request = resolution.id ? store.put(resolution) : store.add(resolution);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteResolution(id) {
        const tx = this.db.transaction('resolutions', 'readwrite');
        const store = tx.objectStore('resolutions');
        return new Promise((resolve, reject) => {
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Votes
    async getVotes(resolutionId) {
        const tx = this.db.transaction('votes', 'readonly');
        const store = tx.objectStore('votes');
        const index = store.index('resolutionId');
        return new Promise((resolve, reject) => {
            const request = index.getAll(resolutionId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveVote(vote) {
        const tx = this.db.transaction('votes', 'readwrite');
        const store = tx.objectStore('votes');
        return new Promise((resolve, reject) => {
            const request = vote.id ? store.put(vote) : store.add(vote);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteVotesByResolution(resolutionId) {
        const tx = this.db.transaction('votes', 'readwrite');
        const store = tx.objectStore('votes');
        const index = store.index('resolutionId');
        return new Promise((resolve, reject) => {
            const request = index.openCursor(resolutionId);
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    cursor.delete();
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
    }
}

// Instance globale
const db = new Database();

