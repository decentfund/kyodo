import express from 'express';

import { createTask, modifyTask, getTasks } from './task';
import { getAllTips } from './tip';
import { getAllDomains, getDomainById } from './domain';
import { addUser, getAllUsers } from './user';
import * as ipfs from './ipfs';

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
  .get('/tips', async (req, res) => {
    try {
      const tips = await getAllTips();
      return res.status(200).send(tips);
    } catch (err) {
      return res.status(400).send(err);
    }
  })
  .get('/domain', (req, res) => {
    getDomainById(req, res);
  })
  .get('/domains', async (req, res) => {
    try {
      const domains = await getAllDomains();
      return res.status(200).send(domains);
    } catch (err) {
      return res.status(400).send(err);
    }
  })
  .post('/user', (req, res) => {
    addUser(req, res);
  })
  .get('/users', (req, res) => {
    getAllUsers(req, res);
  })
  .get('/task/:hash', async (req, res) => {
    const specification = await ipfs.getTaskSpecification(req.params.hash);
    return res.status(200).send(specification);
  })
  .post('/task/hash', async (req, res) => {
    const specificationHash = await ipfs.generateIpfsHash(req.body);
    return res.status(200).send(specificationHash);
  });

module.exports = router;
