import { createBasicConfig } from '@open-wc/building-rollup';
import json from '@rollup/plugin-json';
import commonjs from 'rollup-plugin-commonjs';
import replace from '@rollup/plugin-replace';
import styles from 'rollup-plugin-styles';
import litcss from 'rollup-plugin-lit-css';
import visualizer from 'rollup-plugin-visualizer';
import deepmerge from 'deepmerge';
const { injectManifest } = require('rollup-plugin-workbox');
const path = require('path');
const { createMpaConfig } = require('./_building-rollup/createMpaConfig.js');
import posthtml from 'posthtml';
import spectrumMarkdown, {
    postHTMLSpectrumTypeography,
} from './src/utils/posthtml-spectrum-docs-markdown';
import load from './src/utils/posthtml-loading';
const Terser = require('terser');
const { postCSSPlugins } = require('../../scripts/css-processing.js');
const fs = require('fs-extra');
const postcss = require('postcss');
const purgecss = require('@fullhuman/postcss-purgecss');

const transform = (inputPath) => {
    const url = inputPath.split('_site/')[1];
    return (html, args) => {
        const preloadModules = [
            // {
            //     regex: /theme-dark\./,
            //     options: {
            //         method: 'modulepreload',
            //         media: 'screen and (prefers-color-scheme: dark)',
            //         crossorigin: 'anonymous',
            //     },
            // },
            // {
            //     regex: /theme-light\./,
            //     options: {
            //         method: 'modulepreload',
            //         media: 'screen and (prefers-color-scheme: light)',
            //         crossorigin: 'anonymous',
            //     },
            // },
            // {
            //     regex: /scale-medium\./,
            //     options: {
            //         method: 'modulepreload',
            //         crossorigin: 'anonymous',
            //     },
            // },
        ];
        const bundle = args.bundles.module ? args.bundles.module : args.bundle;
        for (let path in bundle.bundle) {
            const module = bundle.bundle[path];
            if (module.modules) {
                preloadModules.map((preloadModule) => {
                    if (
                        Object.keys(module.modules).find((key) =>
                            preloadModule.regex.test(key)
                        )
                    ) {
                        preloadModule.fileName = module.fileName;
                    }
                });
            }
        }
        const initialHTML = posthtml()
            .use(
                spectrumMarkdown(url),
                ...preloadModules.map((preloadModule) =>
                    load([preloadModule.fileName], preloadModule.options)
                )
            )
            .process(html, { sync: true }).html;
        const inputCss = fs.readFileSync(
            `${process.cwd()}/src/components/styles.css`,
            { encoding: 'utf8' }
        );
        const htmlOutput = postcss([
            ...postCSSPlugins(),
            purgecss({
                content: [
                    {
                        extension: 'html',
                        raw: initialHTML,
                    },
                ],
            }),
        ])
            .process(inputCss, {
                from: `${process.cwd()}/src/components/`,
                // to: outputCssPath,
            })
            .then((result) => {
                return posthtml()
                    .use(
                        postHTMLSpectrumTypeography({
                            customTransforms: [
                                {
                                    selector: '[href="styles.css"]',
                                    fn: (node) => {
                                        return {
                                            tag: 'style',
                                            content: [result.css],
                                        };
                                    },
                                },
                            ],
                        })
                    )
                    .process(initialHTML, { sync: true }).html;
            });
        return htmlOutput;
    };
};

const optionsHTML = {
    inputPathBoundTransform: transform,
    minify: {
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        caseSensitive: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        /** @param {string} code */
        minifyJS: (code) => Terser.minify(code).code,
    },
};

const configSW = deepmerge(
    createBasicConfig({
        legacyBuild: false,
        developmentMode: false,
    }),
    {
        input: path.join(process.cwd(), '_site', 'serviceWorker.js'),
        plugins: [
            replace({
                'process.env.NODE_ENV': JSON.stringify('production'),
            }),
        ],
    }
);

module.exports = async () => {
    const mpaConfig = await createMpaConfig({
        outputDir: 'dist',
        legacyBuild: false,
        inputGlob: '_site/**/*.html',
        rootPath: path.resolve('_site'),

        // development mode creates a non-minified build for debugging or development
        developmentMode: false, // process.env.ROLLUP_WATCH === 'true',

        injectServiceWorker: false,
        workbox: false,
        html: optionsHTML,
    });

    mpaConfig.output.sourcemap = true;

    mpaConfig.moduleContext = {
        [require.resolve('focus-visible')]: 'window',
    };
    mpaConfig.plugins.push(json());

    mpaConfig.plugins.push(
        styles({
            mode: 'emit',
            minimize: true,
            plugins: postCSSPlugins(),
        })
    );
    mpaConfig.plugins.push(litcss());
    mpaConfig.plugins.push(
        commonjs({
            exclude: [
                '../../node_modules/focus-visible/**',
                '../../node_modules/prismjs/**',
            ],
        })
    );
    mpaConfig.plugins.push(
        replace({
            exclude: '*.css',
            values: {
                'process.env.NODE_ENV': '"production"',
            },
        })
    );
    mpaConfig.plugins.push(
        injectManifest({
            swSrc: path.join(process.cwd(), '_site', 'sw.js'),
            swDest: path.join(process.cwd(), 'dist', 'sw.js'),
            globDirectory: path.join(process.cwd(), 'dist'),
            globPatterns: ['**/*.{html,js,css,png,svg,ico,webmanifest}'],
            globIgnores: [
                '*nomodule*',
                'components/*/index.html',
                'components/*/api/index.html',
            ],
            additionalManifestEntries: [
                {
                    url: 'index.html?homescreen',
                    revision: '3',
                },
            ],
        })
    );

    // mpaConfig.plugins.push(
    //     copy({
    //         targets: [
    //             { src: '_site-dev/styles.css', dest },
    //             { src: '_site-dev/demoing/demo/custom-elements.json', dest },
    //             { src: '_site-dev/manifest.json', dest },
    //             { src: '_site-dev/**/*.{png,gif}', dest },
    //         ],
    //         flatten: false,
    //     }),
    // );

    mpaConfig.plugins.push(
        visualizer({
            brotliSize: true,
            gzipSize: true,
        })
    );

    return [
        {
            ...configSW,
            output: {
                file: path.join(process.cwd(), '_site', 'sw.js'),
                format: 'es',
            },
        },
        mpaConfig,
    ];
};
