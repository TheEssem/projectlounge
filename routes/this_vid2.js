import { Router } from "express";
import multer, { diskStorage } from "multer";
import { extname, join, dirname } from "path";
import url from "url";
var storage = diskStorage({
  destination: function(req, file, cb) {
    cb(null, "/tmp/");
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + extname(file.originalname)); // Appending extension
  },
});
import generateVideo from "../generateVideo.js";
import { getVid } from "./ytdl.js";
import { fileTypeFromFile } from "file-type";
var upload = multer({ storage: storage });
var router = Router();

var outMap = new Map();

router.get("/", function(req, res) {
  res.sendFile(join(`${dirname(url.fileURLToPath(import.meta.url))}/../views/this_vid2.html`));
  //res.render("this_vid2", { title: "this_vid2: Web Edition" });
});

router.get("/uploadytdl", async function(req, res, next) {
  if (!req.query.url) {
    const error = new Error("Bad Request");
    res.status(400);
    return next(error);
  } else {
    try {
      new URL(req.query.url);
    } catch {
      const error = new Error("Bad Request");
      res.status(400);
      return next(error);
    }
    try {
      const out = await getVid(req, true);
      if (!out.fileType.mime.includes("video")) {
        res.status(400);
        return res.json({
          data: null,
          error: "The uploaded file is not a video.",
        });
      }
      var id = Math.random().toString(36).substring(2, 15);
      var stream = await generateVideo({ buffer: out.buffer });
      outMap.set(id, stream);
      res.json({
        data: `/thisvid2/video/${id}`,
        error: null,
      });
    } catch (err) {
      console.error(err);
      res.status(500);
      return res.json({ data: null, error: err });
    }
  }
});

router.post("/upload", upload.single("video"), async function(req, res) {
  try {
    const type = await fileTypeFromFile(req.file.path);
    if (!type.mime.includes("video")) {
      res.status(400);
      return res.json({
        data: null,
        error: "The uploaded file is not a video.",
      });
    }
    var id = Math.random().toString(36).substring(2, 15);
    //var filename = await generateVideo(req.file.path, id);
    var stream = await generateVideo({ file: req.file.path });
    outMap.set(id, stream);
    res.json({
      data: `/thisvid2/video/${id}`,
      error: null,
    });
  } catch (err) {
    res.status(500);
    return res.json({ data: null, error: err });
  }
});

router.get("/video/:id", async function(req, res, next) {
  try {
    var stream = outMap.get(req.params.id);
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=\"this_vid2.mp4\""
    );
    return stream.pipe(res);
  } catch (e) {
    res.status(404);
    next();
  }
});

export default router;
