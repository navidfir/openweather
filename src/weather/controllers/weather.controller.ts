import { Request, Response } from "express";
import { WeatherService } from "../services/weather.service";
import { KafkaBroker } from "../queue/kafka/kafka-broker.service";
import { RedisClient } from "../cache/redis.service";

const redis = new RedisClient();
const KAFKA_BROKERS = ["kafka1:9092", "kafka2:9093", "kafka3:9094"];
const broker = new KafkaBroker(process.env.KAFKA_CLIENT_ID ||
    "weather-api", KAFKA_BROKERS, process.env.KAFKA_GROUP_ID ||
"weather-workers");
const weatherService = new WeatherService(redis, broker);

export class WeatherController {
    static async getAll(req: Request, res: Response) {
        try {
            const { detailed, page, limit, from, to, cityCode, countryCode } = req.query;
            const result = await weatherService.getAll({
                detailed: detailed === "true",
                page: page ? parseInt(page as string, 10) : 1,
                limit: limit ? parseInt(limit as string, 10) : 50,
                from: from ? new Date(from as string) : undefined,
                to: to ? new Date(to as string) : undefined,
                cityCode: cityCode as string | undefined,
                countryCode: countryCode as string | undefined,
            });
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const weather = await weatherService.getById(id, true);
            if (!weather) {
                return res.status(404).json({ error: "Weather record not found" });
            }
            res.json(weather);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    static async create(req: Request, res: Response) {
        try {
            const { cityName, country } = req.body;
            if (!cityName || !country) {
                return res.status(400).json({ error: "cityName and country are required" });
            }

            const weather = await weatherService.create(cityName);
            res.status(201).json(weather);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    static async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const updates = req.body;
            const updated = await weatherService.update(id, updates);
            if (!updated) {
                return res.status(404).json({ error: "Weather record not found" });
            }
            res.json(updated);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    static async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const deleted = await weatherService.delete(id);
            if (!deleted) {
                return res.status(404).json({ error: "Weather record not found" });
            }
            res.json({ message: "Weather record deleted successfully" });
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    static async getLatest(req: Request, res: Response) {
        try {
            const { cityName } = req.params;
            if (!cityName) {
                return res.status(400).json({ error: "cityName is required" });
            }

            const latest = await weatherService.getLatest(cityName, true);
            if (!latest) {
                return res.status(404).json({ error: "No weather data found" });
            }
            res.json(latest);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }
}
