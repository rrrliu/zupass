import cors from "cors";
import express from "express";
import morgan from "morgan";
import { EventName, sendEvent } from "../apis/honeycombAPI";
import { ApplicationContext } from "../types";
import { IS_PROD } from "../util/isProd";
import { initHealthcheckRoutes } from "./routes/healthCheckRoutes";
<<<<<<< HEAD
import { initStaticRoutes } from "./routes/staticRoutes";
=======
import { initPCDRoutes } from "./routes/pcdRoutes";
>>>>>>> a00ecd5 (working e2e server side proof)
import { initZuzaluRoutes } from "./routes/zuzaluRoutes";
import { RouteInitializer } from "./types";

const routes: RouteInitializer[] = [
  initHealthcheckRoutes,
  initZuzaluRoutes,
<<<<<<< HEAD
  initStaticRoutes,
=======
  initPCDRoutes,
>>>>>>> a00ecd5 (working e2e server side proof)
];

export async function startServer(
  context: ApplicationContext
): Promise<express.Application> {
  return new Promise<express.Application>((resolve, reject) => {
    const port = IS_PROD ? process.env.PORT : 3002;
    const app = express();
    app.use(morgan("tiny"));
    app.use(express.json());
    app.use(cors());

    routes.forEach((r) => r(app, context));

    app.use(
      cors({
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
      })
    );

    app.use(
      (err: Error, req: express.Request, res: express.Response, next: any) => {
        console.error(`[ERROR] ${req.method} ${req.url}`);
        console.error(err.stack);
        res.status(500).send(err.message);
      }
    );

    app
      .listen(port, () => {
        console.log(`[INIT] HTTP server listening on port ${port}`);
        sendEvent(context, EventName.SERVER_START);
        resolve(app);
      })
      .on("error", (e: Error) => {
        reject(e);
      });

    return app;
  });
}
