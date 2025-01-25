const LOCAL_STORE_KEY = 'DDS_APP_REPOSITORY';

export default class Repository {
    private storage: Storage;

    constructor(storage?: Storage) {
        this.storage = storage || localStorage;
    }

    storePbn(pbn: string): void {
        const state: Record<string, unknown> =
            JSON.parse(this.storage.getItem(LOCAL_STORE_KEY) || '{}');

        state.pbn = pbn;

        this.storage.setItem(LOCAL_STORE_KEY, JSON.stringify(state));
    }

    readPbn(): string {
        const state: Record<string, unknown> =
            JSON.parse(this.storage.getItem(LOCAL_STORE_KEY) || '{}');

        return typeof state.pbn === 'string' ? state.pbn : '';
    }
}