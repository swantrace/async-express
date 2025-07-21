import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { compose, wrapMiddleware } from "./core/compose";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import expressLayouts from "express-ejs-layouts";

// Import new route modules
import apiRoutes from "./routes/api/index";
import webRoutes from "./routes/web/index";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security and parsing middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  })
);
app.use(cookieParser());
app.use(
  express.json({
    type: ["application/json", "application/fhir+json"],
  })
);
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(process.cwd(), "public")));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "src", "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");

// Routes
app.use("/api", apiRoutes);
app.use("/", webRoutes);

// 404 fallback
app.use((_req, res) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    message: "The page you're looking for doesn't exist.",
    error: { status: 404 },
  });
});

export default app;
