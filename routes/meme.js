import { Router, static as expStatic } from "express";
import serveIndex from "serve-index";
const router = Router();
import { readdirSync } from "fs";
import config from "../config.js";
const dir = readdirSync(config.memeDir);
const files = dir.filter(function(e) { return e.match(/.*\.(png|gif|jpg|jpeg|webp)/ig); });

/* GET home page. */
router.get("/", function(req, res) {
  res.redirect(302, `/meme/files/${files[Math.floor(Math.random() * files.length)]}`);
});

router.use("/files", expStatic(config.catDir), serveIndex(config.memeDir, { template: "views/files.html" }));

export default router;
