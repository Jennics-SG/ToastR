
// You need to declare a cache name
const cacheName = "toastr"

// Pages and files that will be stored in cache
const precache_assets = [
    "/offline",
    "/home",
    "/scoreboard",
    "/static/main.css",
    "/static/home.css",
    "/static/topNav.css",
    "/static/parallax.css",
    "/static/scoreboard.css",
    "/static/background.png",
    "/static/playButton.png",
    "/static/playButton-invert.png",
    "/manifest",
    "/favicon.ico"
]

// Runs on service worker install
self.addEventListener('install', e => {
    console.log('[Service Worker] install')

    // Wait for cache to be open and then add all files in precache_assets
    const addToCache = async () => {
        const cache = await caches.open("toastr");
        console.log("[Service Worker] Caching")
        await cache.addAll(precache_assets)
    }

    // Use waitUntil to ensure the service worker doesn't shut
    // down until files have been added to cache
    e.waitUntil(addToCache())
})

// Runs of service worker activation
self.addEventListener('activate', e => {
    console.log("[Service Worker] Activating")

    // Claims the browser window without having to reload the page
    e.waitUntil(clients.claim())
})

// Runs when the service worker fetches a file
self.addEventListener("fetch", e => {
    e.respondWith(
        (async () => {
            try{
                // Try network before cache
                const networkResponse = await fetch(e.request);
                return networkResponse
            } catch(error){
                // Catch is triggered if network fails or items are not found in cache

                const cache = await caches.open(cacheName);
                let cachedResponse = await cache.match(e.request)

                // if file is found in the cache, return file
                if(cachedResponse){
                    const cachedResponse = await cache.match(e.request);
                    return cachedResponse
                }

                // Return offline page if all other requests fail
                cachedResponse = await cache.match("/offline");
                return cachedResponse
            }
        })()
    )
})