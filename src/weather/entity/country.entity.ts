import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { City } from "./city.entity";

@Entity()
export class Country {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({ unique: true })
    code: string;

    @OneToMany(() => City, (city) => city.country, { cascade: true })
    cities: City[];
}
