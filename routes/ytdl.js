import { Router } from "express";
const router = Router();
import { join } from "path";
import path from "path";
import url from "url";

router.get("/", function(req, res) {
  res.sendFile(join(`${path.dirname(url.fileURLToPath(import.meta.url))}/../views/ytdl.html`));
});

router.get("/download", async function(req, res, next) {
  const error = new Error("This service has been discontinued.");
  res.status(418);
  next(error);
});

router.get("/info", async function(req, res, next) {
  const error = new Error("This service has been discontinued.");
  res.status(418);
  next(error);
});

export {
  router as default
};