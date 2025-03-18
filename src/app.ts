import express from "express";
import path from "path";
import { compose, wrapMiddleware } from "./core/compose";
import helmet from "helmet";
const app = express();

app.use(helmet());
app.use(express.static("public"));
app.use(
  express.json({
    type: ["application/json", "application/fhir+json"],
  })
);
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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
