import { Router } from "express";
const router = Router();
import { readdirSync } from "fs";
import config from "../config.js";
const dir = readdirSync(config.catDir);
const files = dir.filter(function(e) { return e.match(/.*\.(png|gif|jpg|jpeg|webp)/ig); });

/* GET home page. */
router.get("/", function(req, res) {
  res.redirect(302, `https://projectlounge.pw/cta/files/${files[Math.floor(Math.random() * files.length)]}`);
});

export default router;
