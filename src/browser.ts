import {chromium, BrowserContext, Browser, ChromiumBrowser } from "playwright";
import { Logger } from "./logger";
let __browser:ChromiumBrowser|null = null;
export async function createBrowser(){
  if(!__browser){
    __browser = await chromium.launch({headless:process.env.NODE_ENV !== "dev"});
    Logger.debug("Browser connected");
    __browser.on('disconnected', () => {
      __browser = null;
    })
  } return __browser;
}
export function getBrowser(){
   return __browser;
}