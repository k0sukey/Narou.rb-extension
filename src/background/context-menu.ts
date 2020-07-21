import { sendToDownload } from './send-to-download';

export function createContextMenu() {
  chrome.contextMenus.create({
    id: 'send-to-download',
    title: 'この小説を Narou.rb でダウンロード',
    contexts: ['all'],
  });
}

chrome.contextMenus.onClicked.addListener(({ menuItemId }) => {
  switch (menuItemId) {
    case 'send-to-download':
      sendToDownload();
      break;
  }
});
