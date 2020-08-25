import { precacheAndRoute, getCacheKeyForURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { skipWaiting, clientsClaim, cacheNames } from 'workbox-core';
import { strategy as composeStrategies } from 'workbox-streams';

skipWaiting();
clientsClaim();

// Cache the Typekit stylesheets with a stale while revalidate strategy.
registerRoute(
    /^https:\/\/use\.typekit\.net\/evk7lzt\.css$/,
    new CacheFirst({
        cacheName: 'typekit-stylesheets',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
            }),
        ],
    })
);

registerRoute(
    /^https:\/\/p\.typekit\.net/,
    new CacheFirst({
        cacheName: 'typekit-stylesheets',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
            }),
        ],
    })
);

registerRoute(
    /^https:\/\/img\.shields\.io/,
    new StaleWhileRevalidate({
        cacheName: 'badges',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
            }),
        ],
    })
);

// Cache the Typekit webfont files with a cache first strategy for 1 year.
registerRoute(
    /^https:\/\/use\.typekit\.net/,
    new CacheFirst({
        cacheName: 'typekit-webfonts',
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200],
            }),
            new ExpirationPlugin({
                maxAgeSeconds: 60 * 60 * 24 * 365,
            }),
        ],
    })
);

const shellStrategy = new CacheFirst({ cacheName: cacheNames.precache });
const contentStrategy = new StaleWhileRevalidate({ cacheName: 'content' });

const componentHandler = composeStrategies([
    () =>
        shellStrategy.handle({
            request: new Request(getCacheKeyForURL('/shell-start.html')),
        }),
    ({ url }) =>
        contentStrategy.handle({
            request: new Request(
                url.pathname.replace('index.html', '') + 'content/index.html'
            ),
        }),
    ({ url }) =>
        contentStrategy.handle({
            request: new Request(
                url.pathname.replace('index.html', '') +
                    'api-content/index.html'
            ),
        }),
    () =>
        shellStrategy.handle({
            request: new Request(getCacheKeyForURL('/shell-end.html')),
        }),
]);

const guideHandler = composeStrategies([
    () =>
        shellStrategy.handle({
            request: new Request(getCacheKeyForURL('/shell-start.html')),
        }),
    ({ url }) =>
        contentStrategy.handle({
            request: new Request(
                url.pathname.replace('index.html', '') + 'content/index.html'
            ),
        }),
    () =>
        shellStrategy.handle({
            request: new Request(getCacheKeyForURL('/shell-end.html')),
        }),
]);

const homeHandler = composeStrategies([
    // () =>
    //     shellStrategy.handle({
    //         request: new Request(getCacheKeyForURL('/shell-start.html')),
    //     }),
    ({ url }) =>
        contentStrategy.handle({
            request: new Request(
                url.pathname //.replace('index.html', '') + 'content/index.html'
            ),
        }),
    // () =>
    //     shellStrategy.handle({
    //         request: new Request(getCacheKeyForURL('/shell-end.html')),
    //     }),
]);

const navigationHandler = (...args) => {
    const component = args[0].url.pathname.search('components') !== -1;
    const api = args[0].url.pathname.search('api') !== -1;
    const guide = args[0].url.pathname.search('guides') !== -1;
    if (component && api) {
        console.log('component api');
        return componentHandler(...args);
    } else if (component) {
        console.log('component');
        return componentHandler(...args);
    } else if (guide) {
        console.log('guide');
        return guideHandler(...args);
    }
    console.log('home');
    return homeHandler(...args);
};

registerRoute(({ request }) => request.mode === 'navigate', navigationHandler);

precacheAndRoute(self.__WB_MANIFEST);
