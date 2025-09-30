
import "dotenv/config";
import cluster from "cluster";
import os from "os";
import { KafkaBroker } from "./weather/queue/kafka/kafka-broker.service";
import { KafkaWeatherRequestService } from "./weather/queue/kafka/kafka-worker.service";
import { RedisClient } from "./weather/cache/redis.service";
import { initDataSource } from "./weather/repositories/data-source";

const NUM_WORKERS = process.env.NUM_WORKERS ? parseInt(process.env.NUM_WORKERS) : os.cpus().length;

const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || "weather-api";
const KAFKA_GROUP_ID = process.env.KAFKA_GROUP_ID || "weather-workers";

const KAFKA_BROKERS = ["kafka1:9092", "kafka2:9093", "kafka3:9094"];

if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    for (let i = 0; i < 2; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    (async () => {
        try {
            const broker = new KafkaBroker(KAFKA_CLIENT_ID, KAFKA_BROKERS, KAFKA_GROUP_ID);
            await broker.connect();

            const redis = new RedisClient();
            await redis.connect();

            const dataSource = await initDataSource();

            const service = new KafkaWeatherRequestService(broker, redis, dataSource);
            await service.startConsumer();

            console.log(`Worker ${process.pid} started and consuming messages`);
        } catch (err) {
            console.error(`Worker ${process.pid} failed to start:`, err);
            process.exit(1);
        }
    })();
}