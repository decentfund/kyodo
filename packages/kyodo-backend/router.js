const express = require("express");

const { createColony, getColonies } = require("./colony");
const { createTask, modifyTask, getTasks } = require("./task.js");

const router = express.Router();

router
  .post("/shitter", (req, res) => {
    createTask(req, res);
  })
  .post("/task", (req, res) => {
    modifyTask(req, res);
  })
  .get("/task", (req, res) => {
    getTasks(req, res);
  })
  .post("/colony", (req, res) => {
    createColony(req, res);
  })
  .get("/colony", (req, res) => {
    getColonies(req, res);
  })
  .post("/client", (req, res) => {
    createTask(req, res);
  });

module.exports = router;
