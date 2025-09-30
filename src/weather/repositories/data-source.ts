import "reflect-metadata";
import { DataSource } from "typeorm";
import { City } from "../entity/city.entity";
import { Country } from "../entity/country.entity";
import { Weather } from "../entity/weather.entity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "postgres",
    port: 5432,
    username: "weather_user",
    password: "mysecretpassword",
    database: "weather_forecast",
    synchronize: true,
    logging: true,
    entities: [Country, City, Weather],
    migrations: [],
    subscribers: [],
});

let initialized: boolean = false;

export async function initDataSource(): Promise<DataSource> {
    if (!initialized) {
        await AppDataSource.initialize();
        initialized = true;
        console.log("✅ TypeORM DataSource initialized");
    }
    return AppDataSource;
}
