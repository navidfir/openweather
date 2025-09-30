import { Router } from "express";
import { WeatherController } from "../controllers/weather.controller";

const router = Router();

router.get("/", WeatherController.getAll);
router.get("/:id", WeatherController.getById);
router.post("/", WeatherController.create);
router.put("/:id", WeatherController.update);
router.delete("/:id", WeatherController.delete);
router.get("/latest/:cityName", WeatherController.getLatest);

export default router;
