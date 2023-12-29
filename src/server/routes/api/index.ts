import express from "express";
import { Router } from "express";
import errorHandlingMiddleware from "../../middleware/errorHandling";

const router = Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// TODO: Add routes here
router.get("/test", (_req, res) => {
  res.json({ msg: "Hello World" });
});

router.use(errorHandlingMiddleware());

export const provide = () => router;
