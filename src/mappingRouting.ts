import Router from "@koa/router";
import { getBrowser } from "./browser";
import { Logger } from "./logger";

export function mappingRouting(router: Router<any, {}>) {
  router.post("/", async ctx => {
    const browser = getBrowser();
    if (browser){
      const url = ctx.request.body?.url;
      const clip = ctx.request.body?.clip;
      Logger.debug(`new job ${url}`)
      if(url){
        const page = await browser.newPage();
        page.setViewportSize({width:1280, height:720})
        Logger.debug(`create new page`);
        await page.goto(url);
        await new Promise(res => setTimeout(res, 5*1000));
        Logger.debug(`loaded ${url}`)
        const image = await page.screenshot({type:"jpeg",fullPage:true, quality:100, clip});
        Logger.debug(`screnshoot page ${url} is done`)
        await page.close();
        ctx.response.type ="image/jpeg";
        ctx.response.body = image;
      }
    }
  })
}
