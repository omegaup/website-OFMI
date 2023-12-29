import { ErrorRequestHandler } from "express";

const errorHandling: ErrorRequestHandler = async (err, _req, res, _next) => {
  res.status(500).json({
    msg: err.message,
    success: false,
  });
};

export default () => errorHandling;
