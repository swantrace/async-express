import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { compose, wrapMiddleware } from "./core/compose.js";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import authRoutes from "./auth/routes.js";
import userRoutes from "./api/user.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(helmet());
app.use(cookieParser());
app.use(
  express.json({
    type: ["application/json", "application/fhir+json"],
  })
);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));

// Auth routes
app.use("/api/auth", authRoutes);

// Protected user routes
app.use("/api/user", userRoutes);

app.get(
  "/",
  compose([
    wrapMiddleware((_req, res) => {
      res.render("index");
    }),
  ])
);

// curl POST "http://localhost:4000/ajax" -d '{"name": "John Doe"}' -H "Content-Type: application/json"

// add 404 fallback
app.use((_req, res) => {
  res.status(404).send("404 Not Found");
});

app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
