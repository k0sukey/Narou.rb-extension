import {createContextMenu} from "./context-menu";

chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});
