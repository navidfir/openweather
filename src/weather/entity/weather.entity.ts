import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { City } from "./city.entity";

@Entity()
export class Weather {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => City, (city) => city.id, {
        onDelete: "CASCADE",
    })
    city: City;

    @Column("float")
    temperature: number;

    @Column()
    description: string;

    @Column("int")
    humidity: number;

    @Column("float")
    windSpeed: number;

    @Column({ type: "timestamptz" })
    forcastDate: Date;

    @Column({ type: "timestamptz" })
    fetchedAt: Date;

    // Auto-managed timestamps
    @CreateDateColumn({ type: "timestamptz" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamptz" })
    updatedAt: Date;
}
