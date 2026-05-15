
import { authRoutes, clientRoutes, dcRoutes, orderRoutes, productRoutes, reportRoutes,containerRoutes, carrierRoutes} from "./routes/routes";
import { corsConfig } from "./config/cors";
import cors from "cors";
import express from "express";

const app = express();

//SERVER CONFIG
app.use(cors(corsConfig));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dcs', dcRoutes);
app.use('/api/containers', containerRoutes); 
app.use('/api/carriers', carrierRoutes);


export default app;