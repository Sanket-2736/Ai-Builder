import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { connectToDatabase } from './config/db.js';
import authRouter from './routes/authRoutes.js';
import projectRouter from './routes/projectRoutes.js';


const app = express();

app.use(cors({
    origin: process.env.ORIGINS.split(','),
    Credentials: true
}));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => res.send("Server is live!"));

app.use((err, _req, res, _next) => {
    console.log(`Error : ${err.message}`);
    return res.status(500).json({error: err.message});
});

await connectToDatabase();

app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Server live at http://localhost:3000"));