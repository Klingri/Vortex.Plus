document.getElementById('colorWheel').addEventListener('input', (event) => {
  const color = event.target.value;
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (newColor) => {
        document.body.style.backgroundColor = newColor;
      },
      args: [color]
    });
  });
});
