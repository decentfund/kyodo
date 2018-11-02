import express from 'express';

import { createColony, getColonies } from './colony';
import { createTask, modifyTask, getTasks } from './task.js';
import { sendTip, getAllTips } from './tip.js';
import { addDomain, getAllDomains, getDomainById } from './domain.js';
import { addUser, getAllUsers } from './user.js';

import {
  initiateNewPeriod,
  getAllPeriods,
  getCurrentPeriod,
} from './period.js';

const router = express.Router();

router
  .post('/period', (req, res) => {
    initiateNewPeriod(req, res);
  })
  .get('/period', (req, res) => {
    getCurrentPeriod(req, res);
  })
  .get('/periods', (req, res) => {
    getAllPeriods(req, res);
  })
  .post('/task', (req, res) => {
    createTask(req, res);
  })
  .get('/tasks', (req, res) => {
    getTasks(req, res);
  })
  .post('/colony', (req, res) => {
    createColony(req, res);
  })
  .get('/colony', (req, res) => {
    getColonies(req, res);
  })
  .post('/tip', (req, res) => {
    sendTip(req, res);
  })
  .get('/tips', (req, res) => {
    getAllTips(req, res);
  })
  .post('/domain', (req, res) => {
    addDomain(req, res);
  })
  .get('/domain', (req, res) => {
    getDomainById(req, res);
  })
  .get('/domains', (req, res) => {
    getAllDomains(req, res);
  })
  .post('/user', (req, res) => {
    addUser(req, res);
  })
  .get('/users', (req, res) => {
    getAllUsers(req, res);
  });

module.exports = router;
