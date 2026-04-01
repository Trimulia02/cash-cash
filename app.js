const express = require("express");
const app = express();
const path = require("path");
const port = 7000;

const controller = require("./controllers/controller");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

app.get("/", controller.getHomepage);
app.get("/register/add", controller.registerpage);
app.post("/register/add", controller.addRegister);
app.get("/login/add", controller.loginPage);
app.post("/login/add", controller.addLogin);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
