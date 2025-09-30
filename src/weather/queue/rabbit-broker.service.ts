// // brokers/RabbitMQBroker.ts
// import amqplib from "amqplib";
// import { IMessageBroker } from "./message-broker.interface";

// export class RabbitMQBroker implements IMessageBroker {
//     private connection: any;
//     private channel: any;

//     async connect(): Promise<void> {
//         this.connection = await amqplib.connect("amqp://localhost");
//         this.channel = await this.connection.createChannel();
//         console.log("✅ RabbitMQ connected");
//     }

//     async sendMessage(queue: string, message: any): Promise<void> {
//         await this.channel.assertQueue(queue);
//         this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
//     }

//     async consume(queue: string, callback: (msg: any) => Promise<void>): Promise<void> {
//         await this.channel.assertQueue(queue);
//         this.channel.consume(queue, async (msg) => {
//             if (msg) {
//                 const payload = JSON.parse(msg.content.toString());
//                 await callback(payload);
//                 this.channel.ack(msg);
//             }
//         });
//     }
// }
