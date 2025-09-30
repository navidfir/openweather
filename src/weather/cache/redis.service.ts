import { createClient, createCluster, RedisClientType, RedisClusterType } from "redis";
import { IRedisClient } from "./redis.interface";

export class RedisClient implements IRedisClient {
    private cluster: RedisClusterType;
    private REDIS_NODES = [
        { url: "redis://redis-node-1:6379" },
        { url: "redis://redis-node-2:6379" },
        { url: "redis://redis-node-3:6379" },
    ];
    constructor() {
        this.cluster = createCluster({
            rootNodes: this.REDIS_NODES,
        });
    }

    async connect() {
        await this.cluster.connect();
        console.log("✅ Redis connected");
    }

    async disconnect() {
        await this.cluster.disconnect();
    }

    async get(key: string): Promise<string | null> {
        return await this.cluster.get(key);
    }

    async set(
        key: string,
        value: string,
        options?: { EX?: number; NX?: boolean }
    ): Promise<boolean> {
        const result = await this.cluster.set(key, value, options as any);
        return result === "OK";
    }

    async del(key: string): Promise<void> {
        await this.cluster.del(key);
    }

    async exists(key: string): Promise<boolean> {
        const res = await this.cluster.exists(key);
        return res > 0;
    }

    async setLock(key: string, ttlSeconds: number): Promise<boolean> {
        const result = await this.cluster.set(key, "1", { NX: true, EX: ttlSeconds });
        return result === "OK";
    }

    async hSet(hash: string, field: string, value: string): Promise<void> {
        await this.cluster.hSet(hash, field, value);
    }

    async hGet(hash: string, field: string): Promise<string | null> {
        return await this.cluster.hGet(hash, field);
    }

    async hDel(hash: string, field: string): Promise<void> {
        await this.cluster.hDel(hash, field);
    }

    async hGetAll(hash: string): Promise<Record<string, string>> {
        return await this.cluster.hGetAll(hash);
    }

    async hExists(hash: string, field: string): Promise<boolean> {
        const res = await this.cluster.hExists(hash, field);
        return res ? true : false;
    }
}
