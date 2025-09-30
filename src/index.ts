import express from "express";
import dotenv from "dotenv";
import router from "./weather/routes/weather.routes";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/weather", router);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
