import { Router, static as expStatic } from "express";
import serveIndex from "serve-index";
import { readdirSync } from "node:fs";

export default function(name, dirName) {
  const dir = readdirSync(dirName);
  const files = dir.filter((e) => e.match(/.*\.(png|gif|jpg|jpeg|webp)/ig));
  const router = Router();

  router.get("/", (req, res) => {
    res.redirect(302, `/${name}/files/${files[Math.floor(Math.random() * files.length)]}`);
  });
  
  router.use("/files", expStatic(dirName), serveIndex(dirName, { template: "views/files.html" }));
  return router;
}
