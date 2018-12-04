import express from 'express';

import { createColony, getColonies } from './colony';
import { createTask, modifyTask, getTasks } from './task';
import { getAllTips } from './tip';
import { addDomain, getAllDomains, getDomainById } from './domain';
import { addUser, getAllUsers } from './user';

import {
  initiateNewPeriod,
  getAllPeriods,
  getCurrentPeriod,
  getCurrentPeriodSummary,
} from './period';

const router = express.Router();

router
  .post('/period', (req, res) => {
    initiateNewPeriod(req, res);
  })
  .get('/period', (req, res) => {
    getCurrentPeriod(req, res);
  })
  .get('/period/summary', (req, res) => {
    getCurrentPeriodSummary(req, res);
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
  .get('/tips', async (req, res) => {
    try {
      const tips = await getAllTips();
      return res.status(200).send(tips);
    } catch (err) {
      return res.status(400).send(err);
    }
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
