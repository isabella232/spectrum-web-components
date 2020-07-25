/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

import postHTMLSpectrumTypeography from './posthtml-spectrum-typography';
export { postHTMLSpectrumTypeography };

// Add a few doc-specific transforms for code examples

export default (url) =>
    postHTMLSpectrumTypeography({
        customTransforms: [
            {
                selector: 'pre',
                fn: (node) => {
                    const code = node.content[0];
                    if (code && code.tag === 'code') {
                        node.content[0] = {
                            ...code,
                            tag: 'pre',
                            attrs: {
                                ...code.attrs,
                                slot: 'code',
                            },
                        };
                        return {
                            tag: 'code-example',
                            content: node.content,
                            attrs: {
                                ...code.attrs,
                                preprocessed: 'preprocessed',
                            },
                        };
                    }
                    return node;
                },
            },
            {
                selector: 'a',
                fn: (node) => {
                    if (
                        node.attrs.slot &&
                        (node.attrs.slot === 'no-js' ||
                            node.attrs.slot === 'logo')
                    ) {
                        return node;
                    }
                    return {
                        ...node,
                        tag: 'sp-link',
                    };
                },
            },
            {
                selector: 'sp-link',
                fn: (node) => {
                    if (node.attrs.class === 'header-anchor') {
                        node.attrs = {
                            ...node.attrs,
                            href: url + node.attrs.href,
                        };
                    }
                    return node;
                },
            },
            {
                selector: 'div.parts',
                fn: (node) => {
                    return {
                        ...node,
                        content: (node.content || []).reverse(),
                    };
                },
            },
            {
                selector: 'p,ul,ol',
                classes: ['spectrum-Body3'],
            },
            {
                // Wrap h1's in a .spectrum-Article to get nice typography
                // Based on https://spectrum.corp.adobe.com
                selector: 'h1',
                fn: (node) => {
                    if (
                        node.attrs &&
                        node.attrs.class &&
                        (/spectrum-Heading1/.test(node.attrs.class) ||
                            /logo/.test(node.attrs.class))
                    ) {
                        return node;
                    }
                    return {
                        tag: 'div',
                        attrs: { class: 'spectrum-Article' },
                        content: [
                            {
                                tag: 'h1',
                                attrs: { class: 'spectrum-Heading1' },
                                content: node.content,
                            },
                        ],
                    };
                },
            },
            {
                selector: 'h2',
                fn: (node) => {
                    if (
                        node.attrs &&
                        node.attrs.class &&
                        /spectrum-Heading2/.test(node.attrs.class)
                    ) {
                        return node;
                    }
                    return {
                        tag: 'div',
                        attrs: {
                            class: 'headerContainer',
                        },
                        content: [
                            {
                                tag: 'h2',
                                attrs: {
                                    ...node.attrs,
                                    class: 'spectrum-Heading2',
                                },
                                content: node.content,
                            },
                            {
                                tag: 'sp-rule',
                                attrs: { size: 'large' },
                            },
                        ],
                    };
                },
            },
            {
                selector: 'h3',
                classes: ['spectrum-Heading3'],
            },
        ],
    });
