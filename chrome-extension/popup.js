chrome.tabs.query({ active: true, currentWindow: true }).then(function(tabs) {
  const currentUrl = tabs[0].url;
  // Set the iframe src to the current URL with a query parameter
  const iframe = document.getElementById("myFrame");
  iframe.src = "http://localhost:3000/?url=" +
  encodeURIComponent(currentUrl) +
  "&isExtension=true";
});
