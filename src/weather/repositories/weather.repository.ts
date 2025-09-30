import { AppDataSource } from "./data-source";
import { Weather } from "../entity/weather.entity";
import { City } from "../entity/city.entity";

export class WeatherRepository {
    private repo = AppDataSource.getRepository(Weather);

    async getAll(
        detailed: boolean = false,
        page: number = 1,
        limit: number = 50,
        from?: Date,
        to?: Date,
        cityCode?: string,
        countryCode?: string
    ): Promise<{
        data: Weather[];
        total: number;
        page: number;
        limit: number;
    }> {
        const skip = (page - 1) * limit;

        if (detailed) {
            const qb = this.repo.createQueryBuilder("weather")
                .leftJoinAndSelect("weather.city", "city")
                .leftJoinAndSelect("city.country", "country")
                .orderBy("weather.forcastDate", "DESC")
                .skip(skip)
                .take(limit);

            if (from) qb.andWhere("weather.forcastDate >= :from", { from });
            if (to) qb.andWhere("weather.forcastDate <= :to", { to });
            if (cityCode) qb.andWhere("city.code = :cityCode", { cityCode });
            if (countryCode) qb.andWhere("country.code = :countryCode", { countryCode });

            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        } else {
            const qb = this.repo.createQueryBuilder("weather")
                .leftJoin("weather.city", "city")
                .leftJoin("city.country", "country")
                .select([
                    "weather.id",
                    "weather.temperature",
                    "weather.description",
                    "weather.humidity",
                    "weather.windSpeed",
                    "weather.forcastDate",
                    "weather.fetchedAt",
                    "city.code",
                ])
                .orderBy("weather.forcastDate", "DESC")
                .skip(skip)
                .take(limit);

            if (from) qb.andWhere("weather.forcastDate >= :from", { from });
            if (to) qb.andWhere("weather.forcastDate <= :to", { to });
            if (cityCode) qb.andWhere("city.code = :cityCode", { cityCode });
            if (countryCode) qb.andWhere("country.code = :countryCode", { countryCode });

            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
    }

    async getById(id: string, detailed: boolean = false): Promise<any | null> {
        if (detailed) {
            return await this.repo.findOne({
                where: { id },
                relations: ["city", "city.country"],
            });
        } else {
            return await this.repo.createQueryBuilder("weather")
                .leftJoin("weather.city", "city")
                .leftJoin("city.country", "country")
                .select([
                    "weather.id",
                    "weather.temperature",
                    "weather.description",
                    "weather.humidity",
                    "weather.windSpeed",
                    "weather.forcastDate",
                    "weather.fetchedAt",
                    "city.code",
                ])
                .where("weather.id = :id", { id })
                .getRawOne();
        }
    }

    async create(data: {
        city: City;
        temperature: number;
        description: string;
        humidity: number;
        windSpeed: number;
        forcastDate: Date;
        fetchedAt: Date;
    }): Promise<Weather> {
        const weather = this.repo.create({
            city: data.city,
            temperature: data.temperature,
            description: data.description,
            humidity: data.humidity,
            windSpeed: data.windSpeed,
            forcastDate: data.forcastDate,
            fetchedAt: data.fetchedAt,
        });

        return await this.repo.save(weather);
    }

    async update(
        id: string,
        updates: Partial<Pick<
            Weather,
            "temperature" | "description" | "humidity" | "windSpeed" | "forcastDate"
        >>
    ): Promise<Weather | null> {
        const weather = await this.repo.findOne({ where: { id } });
        if (!weather) {
            return null;
        }

        Object.assign(weather, updates);

        return await this.repo.save(weather);
    }

    async delete(id: string): Promise<any | null> {
        const entity = await this.repo.findOne({ where: { id } });
        if (!entity) return null;

        const result = await this.repo.delete(id);
        if (result.affected && result.affected > 0) {
            return entity;
        }

        return null;
    }

    async getLatestByCity(cityId: string): Promise<Weather | null> {
        return await this.repo.createQueryBuilder("weather")
            .leftJoinAndSelect("weather.city", "city")
            .leftJoinAndSelect("city.country", "country")
            .where("city.id = :cityId", { cityId })
            .orderBy("weather.fetchedAt", "DESC")
            .getOne();
    }
}
