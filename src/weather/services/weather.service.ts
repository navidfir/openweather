import { WeatherRepository } from "../repositories/weather.repository";
import { IRedisClient } from "../cache/redis.interface";
import { CityRepository } from "../repositories/city.repository";
import { IMessageBroker } from "../queue/message-broker.interface";

export class WeatherService {
    private weatherRepo: WeatherRepository;
    private cityRepo: CityRepository;
    private inFlight: Map<string, Promise<any>> = new Map();

    constructor(private redis: IRedisClient, private broker: IMessageBroker) {
        this.weatherRepo = new WeatherRepository();
        this.cityRepo = new CityRepository();
    }

    async getAll(options: {
        detailed?: boolean;
        page?: number;
        limit?: number;
        from?: Date;
        to?: Date;
        cityCode?: string;
        countryCode?: string;
    }) {
        const {
            detailed = false,
            page = 1,
            limit = 50,
            from,
            to,
            cityCode,
            countryCode
        } = options;

        const result = await this.weatherRepo.getAll(detailed, page, limit, from, to, cityCode, countryCode);
        return result;
    }

    async getById(id: string, detailed: boolean = false) {
        const weather = await this.weatherRepo.getById(id, detailed);
        if (!weather) return null;
        else return weather;
    }

    async update(id: string, data: Partial<any>) {
        const updatedWeather = await this.weatherRepo.update(id, data);
        if (!updatedWeather) return null;
        return updatedWeather;
    }

    async delete(id: string) {
        const deleted = await this.weatherRepo.delete(id);
        if (!deleted) return false;
        return true;
    }


    async create(cityCode: string) {
        const city = await this.cityRepo.getByCode(cityCode, true);
        if (!city) {
            throw new Error(`City with code ${cityCode} not found`);
        }

        return this.createinFlight(city.code, city.country.code, city.lat, city.lon);

    }

    async getLatest(cityCode: string, strict: boolean = false): Promise<any | null> {
        const city = await this.cityRepo.getByCode(cityCode, true);
        if (!city) {
            throw new Error(`City with code ${cityCode} not found`);
        }

        const key = `weather:${city.code}:${city.country.code}`;

        let cached = await this.redis.get(key);
        if (cached) {
            return JSON.parse(cached);
        }

        const latestWeather = await this.weatherRepo.getLatestByCity(city.id);
        if (latestWeather) {
            await this.redis.set(key, JSON.stringify(latestWeather), { EX: 300 });
            return latestWeather;
        }

        if (strict) {
            return this.createinFlight(city.code, city.country.code, city.lat, city.lon);
        }

        return undefined;
    }

    private async createinFlight(cityCode: string, countryCode: string, lat: number, lon: number) {
        const key = `weather:${cityCode}:${countryCode}`;

        if (this.inFlight.has(key)) {
            return await this.inFlight.get(key);
        }

        const promise = (async () => {
            let cached = await this.redis.get(key);
            if (cached) {
                return JSON.parse(cached);
            }

            await this.broker.sendMessage("weather-requests", { cityCode, countryCode, lat, lon });

            while (!(cached = await this.redis.get(key))) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            return JSON.parse(cached);
        })();

        this.inFlight.set(key, promise);
        const result = await promise;
        this.inFlight.delete(key);

        return result;
    }

}
