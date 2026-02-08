/*  
DESCRIPTION: The following code detects if the PWA is launched as an app or visited as a website.
SOURCE: https://stackoverflow.com/questions/50543163/can-i-detect-if-my-pwa-is-launched-as-an-app-or-visited-as-a-website
*/

// Detects if device is on iOS
const isIos = () => {
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
};

// Detects if device is in standalone mode
const isInStandaloneMode = () =>
  'standalone' in window.navigator && window.navigator.standalone;

// Checks if 'install popup notification' should be displayed
if (isIos() && !isInStandaloneMode()) {
  alert("Install this app via 'Share' → 'Add to Home Screen'");
}
