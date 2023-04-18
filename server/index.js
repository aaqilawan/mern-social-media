// 1.STEP
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
// [Cors] => cross origin for fetch data from backend to frontend
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import { register } from "./controllers/auth.js";
import { createPost } from "./controllers/posts.js";
import { verifyToken } from "./middleware/auth.js";
import User from "./models/User.js";
import Post from "./models/Post.js";
import { users, posts } from "./data/index.js";

/* 2.STEP CONFIGURATIONS */

/* __filename is used when we use package.json type : " module" */
const __filename = fileURLToPath(import.meta.url);
// Directory name
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(express.json());

/* helmet policy start */
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
/* helmet policy end */

// morgan => use for the login
app.use(morgan("common"));

// bodyParser => (json,urlencoded)
app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));

app.use(cors());

// static path set of public asstes in the client side
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* FILE STORAGE {browse from net same receive} */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/assets");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage : storage });

/* ROUTES WITH FILES */
// upload.single("picture") => endpoint
app.post("/auth/register", upload.single("picture"), register); // 4.step
app.post("/posts", verifyToken, upload.single("picture"), createPost);

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/posts", postRoutes);

/* 3.STEP MONGOOSE SETUP */
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser : true,
    useUnifiedTopology : true
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));

    /* ADD DATA ONE TIME */
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.log(`${error} did not connect`));
