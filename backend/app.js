const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

const postsRoutes = require("./routes/posts.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_ATLAS_USER}:${process.env.MONGO_ATLAS_PW}@cluster0.kwjzp.gcp.mongodb.net/${process.env.MONGO_ATLAS_DB}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch((error) => {
    console.log("error", error);
    console.log("Database connection failed!");
  });

/** Parse incoming req.body data to json() format */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/** Allow access to image folder as a static folder */
app.use("/images", express.static(path.join("backend/images")));

/** Allow CORS by setting following headers to
 * Allow any origin access,
 * Allow specific request headers, and
 * Allow specific REST, access verbs
 * OPTIONS is passed along with the POST call
 */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/posts", postsRoutes);
app.use("/api/user", userRoutes);

module.exports = app;
