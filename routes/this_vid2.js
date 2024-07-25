import { extname, join, dirname } from "node:path";
import url from "node:url";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import generateVideo from "../generateVideo.js";
import { fileTypeFromFile } from "file-type";

class Cache extends Map {
  constructor(values) {
    super(values);
    this.maxValues = 2048;
  }

  set(key, value) {
    super.set(key, value);
    if (this.size > this.maxValues) this.delete(this.keys().next().value);
    setTimeout(() => {
      if (super.has(key) && this.get(key) === value && value.data) super.delete(key);
    }, 300000); // delete jobs if not requested after 5 minutes
    return this;
  }
}

/**
 * @param {import("fastify").FastifyInstance} fastify
 */
export default async function(fastify) {
  const outMap = new Cache();

  fastify.get("/", (req, res) => {
    res.sendFile("this_vid2.html", join(`${dirname(url.fileURLToPath(import.meta.url))}/../views`));
  });
  
  fastify.post("/upload", {
    schema: {
      consumes: ["multipart/form-data"],
      response: {
        default: {
          type: "object",
          properties: {
            error: {
              type: "string",
              default: true
            }
          }
        },
        "2xx": {
          type: "object",
          properties: {
            data: { type: "string" }
          }
        }
      }
    }
  }, async (req, res) => {
    try {
      const data = await req.file();
      if (!data) {
        res.status(400);
        return {
          data: null,
          error: "No file was uploaded.",
        };
      }
      const outname = `/tmp/${Date.now()}${extname(data.filename)}`;
      await pipeline(data.file, createWriteStream(outname));
      const type = await fileTypeFromFile(outname);
      if (!type.mime.includes("video")) {
        res.status(400);
        return {
          data: null,
          error: "The uploaded file is not a video.",
        };
      }
      const id = Math.random().toString(36).substring(2, 15);
      const stream = await generateVideo({ file: outname });
      outMap.set(id, stream);
      return {
        data: `/thisvid2/video/${id}`,
        error: null,
      };
    } catch (err) {
      fastify.log.error(err);
      res.status(500);
      return { data: null, error: err };
    }
  });
  
  fastify.get("/video/:id", {
    schema: {
      params: {
        type: "object",
        properties: {
          id: {
            type: "string"
          }
        }
      }
    }
  }, async (req, res) => {
    try {
      const stream = outMap.get(req.params.id);
      res.header(
        "Content-Disposition",
        "attachment; filename=\"this_vid2.mp4\""
      );
      return res.send(stream);
    } catch (e) {
      fastify.log.error(e);
      res.status(404);
    }
  });
}
