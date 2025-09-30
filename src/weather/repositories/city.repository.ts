import { AppDataSource } from "./data-source";
import { City } from "../entity/city.entity";
import { Country } from "../entity/country.entity";

export class CityRepository {
    private repo = AppDataSource.getRepository(City);

    async getAll(
        detailed: boolean = false,
        page: number = 1,
        limit: number = 50
    ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
        const skip = (page - 1) * limit;

        if (detailed) {
            const [data, total] = await this.repo.findAndCount({
                relations: ["country"],
                order: { name: "ASC" },
                skip,
                take: limit,
            });
            return { data, total, page, limit };
        } else {
            const qb = this.repo.createQueryBuilder("city")
                .select(["city.id", "city.name", "city.code"])
                .orderBy("city.name", "ASC")
                .skip(skip)
                .take(limit);

            const [data, total] = await qb.getManyAndCount();
            return { data, total, page, limit };
        }
    }

    async getById(id: string, detailed: boolean = false): Promise<any | null> {
        if (detailed) {
            return await this.repo.findOne({
                where: { id },
                relations: ["country"],
            });
        } else {
            return await this.repo.createQueryBuilder("city")
                .select(["city.id", "city.name", "city.code"])
                .where("city.id = :id", { id })
                .getRawOne();
        }
    }

    async getByCode(code: string, detailed: boolean = false): Promise<any | null> {
        if (detailed) {
            return await this.repo.findOne({
                where: { code },
                relations: ["country"],
            });
        } else {
            return await this.repo.createQueryBuilder("city")
                .select(["city.id", "city.name", "city.code"])
                .where("city.code = :code", { code })
                .getRawOne();
        }
    }

    async create(data: {
        name: string;
        code: string;
        lat: number;
        lon: number;
        country: Country;
    }): Promise<City> {
        const city = this.repo.create(data);
        return await this.repo.save(city);
    }

    async update(
        id: string,
        updates: Partial<Pick<City, "name" | "lat" | "lon" | "country">>
    ): Promise<City | null> {
        const city = await this.repo.findOne({ where: { id } });
        if (!city) return null;
        Object.assign(city, updates);
        return await this.repo.save(city);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repo.delete(id);
        return !!(result.affected && result.affected > 0);
    }
}
