import express, { Express } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { compose, wrapMiddleware } from "./core/compose";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import expressLayouts from "express-ejs-layouts";

// Import new route modules
import apiRoutes from "./routes/api/index";
import webRoutes from "./routes/web/index";

const app: Express = express();

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

// Error handling middleware
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Error:", err);

    res.status(status).render("error", {
      title: status === 500 ? "Server Error" : "Error",
      message: status === 500 ? "Something went wrong on our end." : message,
      error: {
        status,
        stack: process.env.NODE_ENV === "development" ? err.stack : null,
      },
    });
  }
);

export default app;
