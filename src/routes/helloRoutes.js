import express from "express";
import { getHelloWorld } from "../controllers/helloController.js";

const router = express.Router();

router.get("/", getHelloWorld);

export default router;
