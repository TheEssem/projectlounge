import { Router } from "express";
const router = Router();
import { join } from "path";
import { python } from "pythonia";
import { fileTypeStream, fileTypeFromBuffer } from "file-type";
import path from "path";
import url from "url";
import fetch from "node-fetch";

const ytdl = await python("yt_dlp").then(mod => mod.YoutubeDL({}));

router.get("/", function(req, res) {
  res.sendFile(join(`${path.dirname(url.fileURLToPath(import.meta.url))}/../views/ytdl.html`));
});

async function getVid(req, buffer) {
  const info = await ytdl.extract_info$(req.query.url, {download: false}).then(info => info.valueOf());
  let format;
  if (req.query.format) {
    format = info.formats.find(v => {
      return v.format_id === req.query.format;
    });
  } else {
    const formats = info.formats.filter(v => {
      return v.ext === "mp4" && v.acodec !== "none";
    });
    format = formats[formats.length - 1];
  }
  if (!format.filesize) {
    const head = await fetch(format.url, { headers: format.http_headers, method: "HEAD" });
    format.filesize = head.headers.get("Content-Length");
  }
  const data = await fetch(format.url, { headers: format.http_headers });
  if (buffer) {
    const buffer = await data.arrayBuffer();
    const fileType = await fileTypeFromBuffer(buffer);
    return { info, buffer: Buffer.from(buffer), fileType, format };
  } else {
    const typeStream = await fileTypeStream(data.body);
    return { info, typeStream, fileType: typeStream.fileType, format };
  }
}

router.get("/download", async function(req, res, next) {
  if (!req.query.url) {
    const error = new Error("Bad Request");
    res.status(400);
    next(error);
  } else {
    try {
      new URL(req.query.url);
    } catch {
      const error = new Error("Bad Request");
      res.status(400);
      return next(error);
    }
    try {
      const out = await getVid(req);
      const ext = out.typeStream.fileType ? out.typeStream.fileType.ext : "mp4";
      res.attachment(`${out.info.title}.${ext}`).type(ext).set("Content-Length", out.format.filesize);
      out.typeStream.pipe(res);
    } catch (error) {
      res.status(500);
      next(error);
    }
  }
});

router.get("/info", async function(req, res, next) {
  if (!req.query.url) {
    const error = new Error("Bad Request");
    res.status(400);
    next(error);
  } else {
    try {
      new URL(req.query.url);
    } catch {
      const error = new Error("Bad Request");
      res.status(400);
      return next(error);
    }
    try {
      const info = await ytdl.extract_info$(req.query.url, {download: false}).then(info => info.valueOf());
      res.send(info);
    } catch (e) {
      res.status(400);
      console.error(e.stack);
      res.send({ extractError: { type: "ytdlerror", message: e.stack } });
    }
  }
});

export {
  router as default,
  getVid
};