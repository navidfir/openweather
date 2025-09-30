import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: "weather-api",
    brokers: ["kafka1:9092", "kafka2:9093", "kafka3:9094"],
});

export const producer = kafka.producer();

export async function initProducer() {
    await producer.connect();
    console.log("✅ Kafka Producer connected");
}
