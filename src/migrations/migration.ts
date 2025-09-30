import { MigrationInterface, QueryRunner } from "typeorm";
import { Country } from "../weather/entity/country.entity";
import { City } from "../weather/entity/city.entity";

export class SeedCountriesAndCitiesBulk1696150000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        interface CitySeed {
            name: string;
            lat: number;
            lon: number;
            countryIndex: number;
        }

        const countryValues: string[] = [
            "United States", "Canada", "Mexico", "Brazil", "Argentina",
            "United Kingdom", "France", "Germany", "Italy", "Spain",
            "Portugal", "Netherlands", "Belgium", "Switzerland", "Sweden",
            "Norway", "Denmark", "Finland", "Russia", "China",
            "Japan", "South Korea", "India", "Pakistan", "Bangladesh",
            "Vietnam", "Thailand", "Malaysia", "Singapore", "Indonesia",
            "Philippines", "Egypt", "South Africa", "Nigeria", "Kenya",
            "Morocco", "Algeria", "Turkey", "Greece", "Poland",
            "Czech Republic", "Hungary", "Romania", "Bulgaria", "Ukraine",
            "New Zealand", "Australia", "Chile", "Colombia", "Peru"
        ];

        const cityValues: CitySeed[] = [
            { name: "New York", lat: 40.7128, lon: -74.0060, countryIndex: 0 },
            { name: "Los Angeles", lat: 34.0522, lon: -118.2437, countryIndex: 0 },
            { name: "Toronto", lat: 43.651070, lon: -79.347015, countryIndex: 1 },
            { name: "Vancouver", lat: 49.2827, lon: -123.1207, countryIndex: 1 },
            { name: "Mexico City", lat: 19.4326, lon: -99.1332, countryIndex: 2 },
            { name: "Guadalajara", lat: 20.6597, lon: -103.3496, countryIndex: 2 },
            { name: "São Paulo", lat: -23.5505, lon: -46.6333, countryIndex: 3 },
            { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729, countryIndex: 3 },
            { name: "Buenos Aires", lat: -34.6037, lon: -58.3816, countryIndex: 4 },
            { name: "Córdoba", lat: -31.4201, lon: -64.1888, countryIndex: 4 },
            { name: "London", lat: 51.5074, lon: -0.1278, countryIndex: 5 },
            { name: "Manchester", lat: 53.4808, lon: -2.2426, countryIndex: 5 },
            { name: "Paris", lat: 48.8566, lon: 2.3522, countryIndex: 6 },
            { name: "Lyon", lat: 45.7640, lon: 4.8357, countryIndex: 6 },
            { name: "Berlin", lat: 52.5200, lon: 13.4050, countryIndex: 7 },
            { name: "Munich", lat: 48.1351, lon: 11.5820, countryIndex: 7 },
            { name: "Rome", lat: 41.9028, lon: 12.4964, countryIndex: 8 },
            { name: "Milan", lat: 45.4642, lon: 9.1900, countryIndex: 8 },
            { name: "Madrid", lat: 40.4168, lon: -3.7038, countryIndex: 9 },
            { name: "Barcelona", lat: 41.3851, lon: 2.1734, countryIndex: 9 }
        ];

        for (let i = 0; i < countryValues.length; i++) {
            const country = new Country();
            country.name = countryValues[i];
            country.code = countryValues[i].slice(0, 3).toUpperCase();
            await queryRunner.manager.save(country);

            const citiesForCountry = cityValues.filter(c => c.countryIndex === i);
            for (const city of citiesForCountry) {
                const cityEntity = new City();
                cityEntity.name = city.name;
                cityEntity.code = city.name.slice(0, 3).toUpperCase();
                cityEntity.lat = city.lat;
                cityEntity.lon = city.lon;
                cityEntity.country = country;
                await queryRunner.manager.save(cityEntity);
            }
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM city`);
        await queryRunner.query(`DELETE FROM country`);
    }
}
