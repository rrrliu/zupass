import { ProveRequest, VerifyRequest } from "@pcd/passport-interface";
import express, { NextFunction, Request, Response } from "express";
import {
  getSupportedPCDTypes,
  initPackages,
  prove,
  verify,
} from "../../services/proving";
import { ApplicationContext } from "../../types";

export function initPCDRoutes(
  app: express.Application,
  context: ApplicationContext
): void {
  initPackages();

  // // TODO: determine if this is the best way to serve the artifacts
  // app.use(
  //   "/semaphore-artifacts",
  //   express.static(path.join(__dirname, "../../semaphore-artifacts"))
  // );

  app.post(
    "/pcds/prove",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const proveRequest: ProveRequest = req.body;
        const response = await prove(proveRequest);
        res.status(200).json(response);
      } catch (e) {
        next(e);
      }
    }
  );

  app.post(
    "/pcds/verify",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const verifyRequest: VerifyRequest = req.body;
        const response = await verify(verifyRequest);
        res.status(200).json(response);
      } catch (e) {
        next(e);
      }
    }
  );

  app.get(
    "/pcds/supported",
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.json(getSupportedPCDTypes());
      } catch (e) {
        next(e);
      }
    }
  );
}
