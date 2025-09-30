import { Kafka } from "kafkajs";
import { IMessageBroker } from "../message-broker.interface";

export class KafkaBroker implements IMessageBroker {
    private kafka;
    private producer;
    private consumer;
    private bros = ["kafka1:9092", "kafka2:9093", "kafka3:9094"];

    constructor(clientId: string, brokers: string[], groupId: string) {
        this.kafka = new Kafka({ clientId, brokers: this.bros });
        this.producer = this.kafka.producer();
        this.consumer = this.kafka.consumer({ groupId });
    }

    async connect(): Promise<void> {
        await this.producer.connect();
        await this.consumer.connect();
        console.log("✅ Kafka connected");
    }

    async sendMessage(topic: string, message: any): Promise<void> {
        await this.producer.send({
            topic,
            messages: [{ value: JSON.stringify(message) }],
        });
    }

    async consume(topic: string, callback: (msg: any) => Promise<void>): Promise<void> {
        await this.consumer.subscribe({ topic, fromBeginning: false });

        await this.consumer.run({
            eachMessage: async ({ message }) => {
                if (!message.value) return;
                const payload = JSON.parse(message.value.toString());
                await callback(payload);
            },
        });
    }
}
