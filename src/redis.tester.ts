// test-redis-cluster.js
import { createCluster } from "redis";

const REDIS_NODES = [
    { url: "redis://127.0.0.1:7000" },
    { url: "redis://127.0.0.1:7001" },
    { url: "redis://127.0.0.1:7002" },
];

async function testRedisCluster() {
    const cluster = createCluster({ rootNodes: REDIS_NODES });

    cluster.on("error", (err) => console.error("Redis Cluster Error:", err));

    await cluster.connect();
    console.log("✅ Connected to Redis cluster");

    await cluster.set("test_key", "Hello Redis Cluster!", { EX: 10 });
    console.log("Set key: test_key");

    const value = await cluster.get("test_key");
    console.log("Got key:", value);

    await cluster.del("test_key");
    console.log("Deleted key: test_key");

    await cluster.disconnect();
    console.log("✅ Disconnected from Redis cluster");
}

testRedisCluster().catch(console.error);
