import createError from "http-errors";
import express, { json, urlencoded } from "express";
import { join } from "node:path";
import logger from "morgan";
import helmet from "helmet";

import path from "node:path";
import url from "node:url";

import config from "./config.js";

import thisvid2Router from "./routes/this_vid2.js";
import ytdlRouter from "./routes/ytdl.js";
import fileRouter from "./routes/fileRouter.js";

const app = express();

// view engine setup
app.set(
  "views",
  join(path.dirname(url.fileURLToPath(import.meta.url)), "views")
);

app.use(logger("dev"));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use(helmet());
app.use(
  express.static(
    join(path.dirname(url.fileURLToPath(import.meta.url)), "public")
  )
);

app.use("/thisvid2", thisvid2Router);
app.use("/ytdl", ytdlRouter);
app.use("/cta", fileRouter("cta", config.catDir));
app.use("/meme", fileRouter("meme", config.memeDir));
app.use("/bird", fileRouter("bird", config.birdDir));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

export default app;
