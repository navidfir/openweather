export interface IMessageBroker {
    connect(): Promise<void>;
    sendMessage(topic: string, message: any): Promise<void>;
    consume(topic: string, callback: (msg: any) => Promise<void>): Promise<void>;
}

export type MessagePayload = {
    cityCode: string;
    countryCode: string;
    lat: number;
    lon: number;
};
