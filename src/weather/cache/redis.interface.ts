export interface IRedisClient {
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: { EX?: number; NX?: boolean }): Promise<boolean>;
    del(key: string): Promise<void>;
    exists(key: string): Promise<boolean>;
    disconnect(): Promise<void>;
    setLock(key: string, ttlSeconds: number): Promise<boolean>;
    hSet(hash: string, field: string, value: string): Promise<void>;
    hGet(hash: string, field: string): Promise<string | null>;
    hDel(hash: string, field: string): Promise<void>;
    hGetAll(hash: string): Promise<Record<string, string>>;
    hExists(hash: string, field: string): Promise<boolean>;
}
