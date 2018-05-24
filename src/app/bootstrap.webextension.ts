import { binaryToBlob } from "./utils/blob";
import { addFile, setWorkerUrl, fonts } from "./SubtitleEngineLoader";
import { runBootstrap } from './bootstrap';
import { BackgroundHttpClient } from "./http/BackgroundHttpClient";
import { setCrossHttpClient } from "./config";
import container from "../config/inversify.config";
import { IMechanism, IMechanismSymbol } from "./storage/mechanism/IMechanism";
import { WebExtensionMechanism } from "./storage/mechanism/WebExtensionMechanism";
import { IStorage, IStorageSymbol } from "./storage/IStorage";

function getURL(path: string): string {
  if (chrome && chrome.extension && typeof chrome.extension.getURL === "function") {
    return chrome.extension.getURL(path);
  } else if (browser && browser.extension && typeof browser.extension.getURL === "function") {
    return browser.extension.getURL(path);
  } else {
    throw new Error("Browser doesn't support the `browser` or the `chrome` namespace (see https://developer.mozilla.org/en-US/Add-ons/WebExtensions).");
  }
}

setCrossHttpClient(BackgroundHttpClient);

const workerUrl = getURL('/vendor/JavascriptSubtitlesOctopus/subtitles-octopus-worker.js');
const defaultFile = getURL('/vendor/JavascriptSubtitlesOctopus/default.ttf');
const fontFile = getURL('/vendor/JavascriptSubtitlesOctopus/fonts.conf');

setWorkerUrl(workerUrl);

addFile('default.ttf', defaultFile);
addFile('fonts.conf', fontFile);

const arial = getURL('/fonts/arial.ttf');
const arialbd = getURL('/fonts/arialbd.ttf');
const arialbi = getURL('/fonts/arialbi.ttf');
const ariali = getURL('/fonts/ariali.ttf');
const ariblk = getURL('/fonts/ariblk.ttf');

const times = getURL('/fonts/times.ttf');
const timesbd = getURL('/fonts/timesbd.ttf');
const timesbi = getURL('/fonts/timesbi.ttf');
const timesi = getURL('/fonts/timesi.ttf');

const trebuc = getURL('/fonts/trebuc.ttf');
const trebucbd = getURL('/fonts/trebucbd.ttf');
const trebucbi = getURL('/fonts/trebucbi.ttf');
const trebucit = getURL('/fonts/trebucit.ttf');

// Arial
fonts.push(arial, arialbd, arialbi, ariali, ariblk);

// Times New Roman
fonts.push(times, timesbd, timesbi, timesi);

// Trebuchet MS
fonts.push(trebuc, trebucbd, trebucbi, trebucit);

container.bind<IMechanism>(IMechanismSymbol).to(WebExtensionMechanism);

WebExtensionMechanism.active = true;

(async function() { // anon one-time function to load and set sync setting

  // ensure the mechanism knows what we're thinking
  let shouldSync = (await browser.storage.sync.get("sync")).sync || false; // actually force boolean
  WebExtensionMechanism.sync = shouldSync;

  runBootstrap();
})();