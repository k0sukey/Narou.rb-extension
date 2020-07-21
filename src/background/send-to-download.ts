import fetch from 'unfetch';

export function sendToDownload() {
  chrome.windows.getCurrent({ populate: true }, (window) => {
    const found = window.tabs?.find((tab) => tab.active);
    if (found === undefined) {
      return;
    }

    chrome.storage.local.get('webUiUrl', async (items) => {
      const formData = new FormData();
      formData.append('targets', found.url ?? '');
      formData.append('mail', 'false');

      await fetch(`${items.webUiUrl}/api/download`, {
        method: 'POST',
        body: formData,
      });
    });
  });
}
