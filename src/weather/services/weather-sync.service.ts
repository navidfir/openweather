import cron from "node-cron";
import { IMessageBroker } from "../queue/message-broker.interface";
import { AppDataSource } from "../repositories/data-source";
import { City } from "../entity/city.entity";

export class WeatherSyncService {
    private cityRepo = AppDataSource.getRepository(City);

    constructor(private broker: IMessageBroker) { }

    public startScheduler() {
        this.run();

        cron.schedule("*/30 * * * *", () => {
            this.run();
        });

        console.log("WeatherSyncService: cron job scheduled every 30 mins.");
    }

    private async run() {
        console.log("WeatherSyncService: enqueueing weather update jobs...");

        const cities = await this.cityRepo.find();

        for (const city of cities) {
            try {
                await this.broker.sendMessage("weather-requests", {
                    cityCode: city.code,
                    countryCode: city.country.code,
                    lat: city.lat,
                    lon: city.lon
                });

                console.log(`Queued weather job for ${city.name}, ${city.code}`);
            } catch (err: any) {
                console.error(`Failed to queue weather job for ${city.name}:`, err.message);
            }
        }

        console.log("✅ WeatherSyncService: all jobs queued.");
    }
}
