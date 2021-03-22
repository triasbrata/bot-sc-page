import bodyParser from "koa-bodyparser";
import Koa from "koa";
import Router from "@koa/router";
import { mappingRouting } from "./mappingRouting";
import { Logger } from "./logger";
import { createBrowser } from "./browser";
const app = new Koa();
const router = new Router();
const PORT = process.env.PORT || 8000;
mappingRouting(router)
app.use(bodyParser({}))
    .use(router.routes())
    .use(router.allowedMethods());
createBrowser().then(() => {
  app.listen(PORT, () => {
    Logger.debug(`Listeing on http://localhost:${PORT}`)
  });
}).catch(Logger.error)



