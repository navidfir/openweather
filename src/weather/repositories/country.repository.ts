import { AppDataSource } from "./data-source";
import { Country } from "../entity/country.entity";

export class CountryRepository {
    private repo = AppDataSource.getRepository(Country);

    async getAll(
        detailed: boolean = false,
        page: number = 1,
        limit: number = 50
    ): Promise<{ data: any[]; total: number; page: number; limit: number }> {
        const skip = (page - 1) * limit;

        if (detailed) {
            const [data, total] = await this.repo.findAndCount({
                relations: ["cities"],
                order: { name: "ASC" },
                skip,
                take: limit,
            });
            return { data, total, page, limit };
        } else {
            const qb = this.repo.createQueryBuilder("country")
                .select(["country.id", "country.name", "country.code"])
                .orderBy("country.name", "ASC")
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
                relations: ["cities"],
            });
        } else {
            return await this.repo.createQueryBuilder("country")
                .select(["country.id", "country.name", "country.code"])
                .where("country.id = :id", { id })
                .getRawOne();
        }
    }

    async create(data: { name: string; code: string }): Promise<Country> {
        const country = this.repo.create(data);
        return await this.repo.save(country);
    }

    async update(
        id: string,
        updates: Partial<Pick<Country, "name" | "code">>
    ): Promise<Country | null> {
        const country = await this.repo.findOne({ where: { id } });
        if (!country) return null;
        Object.assign(country, updates);
        return await this.repo.save(country);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.repo.delete(id);
        return !!(result.affected && result.affected > 0);
    }
}
