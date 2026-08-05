import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import invitationRoutes from "./routes/invitationRoutes.js";
import employeeRoutes from './routes/employeeRoutes.js';
import attendenceRoutes from './routes/attendenceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js'
import leaveRoutes from "./routes/leaveRoutes.js"

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173", // Vite frontend
        credentials: true,
    })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/invitations", invitationRoutes);
app.use("/api/employee", employeeRoutes);
app.use('/api/attendence', attendenceRoutes)

app.use("/api/dashboard", dashboardRoutes);


// leaves 
app.use("/api/leave", leaveRoutes)

export default app;