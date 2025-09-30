import axios from "axios";
import { City } from "../../entity/city.entity";
import { Weather } from "../../entity/weather.entity";
import { AppDataSource } from "../../repositories/data-source";
import { IMessageBroker } from "../message-broker.interface";
import { IRedisClient } from "../../cache/redis.interface";
import { DataSource } from "typeorm";

export class KafkaWeatherRequestService {

    constructor(private broker: IMessageBroker, private redis: IRedisClient, private dataSource: DataSource) { }

    async queueWeatherRequest(cityCode: string, countryCode: string) {
        await this.broker.sendMessage("weather-requests", { cityCode, countryCode });
    }

    async startConsumer() {
        const cityRepo = this.dataSource.getRepository(City);
        const weatherRepo = this.dataSource.getRepository(Weather);

        await this.broker.consume("weather-requests", async (payload) => {
            const { cityCode, countryCode, lat, lon } = payload;

            console.log(`Processing weather job: ${cityCode}, ${countryCode}`);

            try {
                const lockKey = `lock:weather:${cityCode}:${countryCode}`;
                const lockAcquired = await this.redis.setLock(lockKey, 300);
                if (!lockAcquired) {
                    console.log(`⏭️ Skipping ${cityCode}, ${countryCode} (already being processed)`);
                    return;
                }

                const city = await cityRepo.findOne({ where: { name: cityCode, code: countryCode } });
                if (!city) {
                    return;
                }

                const recentWeather = await weatherRepo.findOne({
                    where: { city },
                    order: { fetchedAt: "DESC" },
                });

                if (recentWeather) {
                    const diff = (new Date().getTime() - recentWeather.fetchedAt.getTime()) / 1000;
                    if (diff < 60 * 30) {
                        console.log(`Skipping ${cityCode}, ${countryCode} (recent weather already fetched)`);
                        return;
                    }
                }

                const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=APPID`;
                const { data } = await axios.get(url);

                const weather = weatherRepo.create({
                    city,
                    temperature: data.main.temp,
                    description: data.weather[0].description,
                    humidity: data.main.humidity,
                    windSpeed: data.wind.speed,
                    fetchedAt: new Date(),
                });

                const savedWeather = await weatherRepo.save(weather);

                await this.redis.set(
                    `weather:${cityCode}:${countryCode}`,
                    JSON.stringify(savedWeather),
                    { EX: 60 * 30 }
                );

                await this.redis.del(lockKey);

                console.log(`Weather data saved for ${cityCode}, ${countryCode}`);
            } catch (err: any) {
                console.error(`Error processing weather job: ${err.message}`);
            }
        });
    }
}
