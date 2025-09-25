import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// MongoDB Initialization
import '../server/config/mongoose-connection.js';

// Routes
import userRouter from '../server/routes/userRoutes.js';
import blogRouter from '../server/routes/blogRoutes.js';
import authRouter from "../server/routes/authRoutes.js"

const app = express();
const PORT = 3000;

app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

// For error: PayloadTooLargeError: request entity too large
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true }, {limit: '50mb'}));

app.use(cookieParser());

app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/blog", blogRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}...`);
});