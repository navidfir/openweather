import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Country } from "./country.entity";


@Entity()
export class City {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    code: string;

    @Column("decimal", { precision: 9, scale: 6 })
    lat: number;

    @Column("decimal", { precision: 9, scale: 6 })
    lon: number;

    @ManyToOne(() => Country, (country) => country.cities, {
        onDelete: "CASCADE",
    })
    country: Country;
}
