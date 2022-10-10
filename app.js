import createError from "http-errors";
import express, { json, urlencoded } from "express";
import { join } from "path";
import logger from "morgan";
import helmet from "helmet";

import path from "path";
import url from "url";

import thisvid2Router from "./routes/this_vid2.js";
import ytdlRouter from "./routes/ytdl.js";
import catRouter from "./routes/cta.js";
import memeRouter from "./routes/meme.js";

var app = express();

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
app.use("/cta", catRouter);
app.use("/meme", memeRouter);

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
