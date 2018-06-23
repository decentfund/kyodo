const express = require("express");

const { createColony, getColonies } = require("./colony");
const { createTask, modifyTask, getTasks } = require("./task.js");
const { sendTip, getAllTips } = require("./tip.js");
const { addDomain, getAllDomains, getDomainById } = require("./domain.js");

const { shitter } = require("./shitter.js");

const router = express.Router();

router
  .post("/shitter", (req, res) => {
    shitter(req, res);
  })
  .post("/task", (req, res) => {
    createTask(req, res);
  })
  .get("/tasks", (req, res) => {
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
