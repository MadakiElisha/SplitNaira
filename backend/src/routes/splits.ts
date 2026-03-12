import { Router } from "express";

export const splitsRouter = Router();

splitsRouter.get("/:projectId", (req, res) => {
  res.status(501).json({
    error: "not_implemented",
    message: `Split project ${req.params.projectId} is not wired yet.`
  });
});

splitsRouter.post("/", (_req, res) => {
  res.status(501).json({
    error: "not_implemented",
    message: "Create split endpoint is not wired yet."
  });
});