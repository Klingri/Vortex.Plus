// Made by Klingri
document.getElementById('colorWheel').addEventListener('input', (event) => {
  const color = event.target.value;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
    });
  });
});
