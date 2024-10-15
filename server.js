const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log("DB connected successful"))
  .catch(() => console.log("Error while connecting to DB"));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(`Listening to port ${port}...`);
  }
});
