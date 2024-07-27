import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import helmet from "@fastify/helmet";
import fastifyMultipart from "@fastify/multipart";

import { join, dirname } from "node:path";
import url from "node:url";

import config from "./config.js";
import fileRouter from "./routes/fileRouter.js";

const app = Fastify({
  logger: true
});

app.register(helmet, { contentSecurityPolicy: false });
app.register(fastifyStatic, {
  root: join(dirname(url.fileURLToPath(import.meta.url)), "public")
});
app.register(fastifyMultipart, {
  limits: {
    files: 1,
    fileSize: 26214400
  }
});

app.register(fileRouter, {
  prefix: "/cta",
  dirName: config.catDir
});
app.register(fileRouter, {
  prefix: "/meme",
  dirName: config.memeDir
});
app.register(fileRouter, {
  prefix: "/bird",
  dirName: config.birdDir
});

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
start();
