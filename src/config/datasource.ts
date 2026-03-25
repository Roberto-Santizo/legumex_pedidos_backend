import { DataSource, DataSourceOptions } from "typeorm";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const options: DataSourceOptions = {
    type: "postgres",
    url: process.env.DB_URL,
    entities: ["./src/entities/entities.ts"],
    synchronize: true,
    ssl: process.env.STAGE == 'prod' ? { rejectUnauthorized: false } : false,
};

const appDatasource = new DataSource(options);

export default appDatasource;
