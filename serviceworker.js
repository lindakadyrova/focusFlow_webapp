/*  
DESCRIPTION: A service worker is installed and activated, which is also able to retrieve cached files.
*/

//it creates a list of all the files to be cached
//@cacheName: 	It is used to give a unique name to the cache und to update it
//				      When the app has a new release such as version 2, we should then add 
//              all of our files (including our new files) to a new cache
const cacheName = 'focusflow-v1';
const filesToCache = [
  './',
  './index.html',
  './offline.html',
  './css/style.css',
  './use_webworker.js',
  './use_serviceworker.js',
  './webworker.js',
  './main.js',
  './install.js',
  './manifest.json',
  './js/script.js',
  './resources/icon.svg',
  './resources/icon-192.svg',
  './resources/icon-512.svg',
  './resources/icon-192.jpg',
  './resources/icon-512.jpg',
  './resources/icon-192.png',
  './resources/icon-512.png'
];

// Install the service worker asynchronously, which then actually caches all the files contained in the above list
// NOTE: Cache only the files that do not change every time
// When registration is complete (see use_serviceworker.js file), the serviceworker.js file is automatically downloaded, 
//   then installed, and finally activated.
// In the install listener, we initialize the cache and add files to the cache for offline use. 
// @waituntil(): 	The service worker does not install until the code inside waitUntil is executed.
// The code inside "then" will be run, asynchronously
// @caches: Caches is a special CacheStorage object available in the scope of the given Service Worker to enable saving data
//					Saving to web storage won't work, because web storage is synchronous.
//					We open a cache with a given name, then add all the files our app uses to the cache, so they can be downloaded 
//          next time (identified by request URL).
self.addEventListener('install', e => {
  console.log('[ServiceWorker] Installing...');
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    }).then(() => {
      console.log('[ServiceWorker] Skip waiting');
      return self.skipWaiting();
    })
  );
});

// This event is usually used to delete any files that are no longer necessary and clean up after the app in general.
self.addEventListener('activate', e => {
  console.log('[ServiceWorker] Activating...');
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== cacheName) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// The service worker fetches content from the cache if it is available there, providing offline functionality
// @RespondWith:  It works as a virtual proxy server between the app and the network. 
//					      Allows to respond to every single request with any response we want: prepared by the Service Worker, 
//                taken from cache, modified if needed.
self.addEventListener('fetch', event => {
  const req = event.request;
  
  //cache only GET requests
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        console.log('[ServiceWorker] Serving from cache:', req.url);
        return cached;
      }

      console.log('[ServiceWorker] Fetching:', req.url);
      return fetch(req).then(response => {
        //check if we received a valid response
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        //clone the response
        const responseToCache = response.clone();
        caches.open(cacheName).then(cache => {
          cache.put(req, responseToCache);
        });

        return response;
      }).catch(error => {
        console.log('[ServiceWorker] Fetch failed, serving offline page:', error);
        
        // Für Navigation Requests offline.html zurückgeben
        if (req.mode === 'navigate') {
          return caches.match('./offline.html');
        }
        
        return new Response('Offline - Resource not available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      });
    })
  );
});
