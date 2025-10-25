import 'dotenv/config'; // automatically loads .env
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routers/authRout.js';
import docsRoutes from './routers/docsRoute.js';
import chatRouter from "./routers/chat.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

app.use('/api/auth', authRoutes);
app.use('/api/docs', docsRoutes);
app.use("/api", chatRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
