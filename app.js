const path = require("path");
const express = require("express");
const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const bodyparser = require("body-parser");

const app = express();
const multer = require("multer");
const filestorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "-" + file.originalname);
  },
});

const filefilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const mongoose = require("mongoose");
app.use(bodyparser.json());
app.use(
  multer({ storage: filestorage, fileFilter: filefilter }).single("image")
);
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

mongoose
  .connect(
    "mongodb+srv://kush:5XCZW5ADqHZDu6Ay@cluster0.1qgxj1a.mongodb.net/messages?retryWrites=true&w=majority&appName=Cluster0 "
  )
  .then((result) => {
    const server = app.listen(8080);
    const io = require("./socket").init(server);
    io.on("conncetion", (socket) => {
      console.log("*********client connceted");
    });
  })
  .catch((err) => console.log(err));
