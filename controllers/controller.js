const { User } = require("../models/index");

class Controller {
  static async getHomepage(req, res) {
    try {
      res.render("home");
    } catch (error) {
      res.send(error);
    }
  }
  static async registerpage(req, res) {
    try {
      const { error } = req.query;
      res.render("register", { error });
    } catch (error) {
      res.send(error);
    }
  }
  static async addRegister(req, res) {
    try {
      const data = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      if (data) {
        res.redirect("/login/add", 200, {});
      }
    } catch (error) {
      res.send(error);
    }
  }
  static async loginPage(req, res) {
    try {
      const { error } = req.query;
      res.render("login", { error });
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
  static async addLogin(req, res) {
    try {
      const { email, password } = req.body;
      if (email === "admin@mail.com" && password === "123") {
        res.redirect("/");
      } else {
        res.redirect("/?error=Invalid email/password");
      }
    } catch (err) {
      res.send(err);
    }
  }
}

module.exports = Controller;
