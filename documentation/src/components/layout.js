/*
Copyright 2020 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/
import { __decorate } from "tslib";
import { html, property, LitElement, } from 'lit-element';
import './side-nav.js';
import layoutStyles from './layout.css';
import '@spectrum-web-components/theme/sp-theme.js';
import '@spectrum-web-components/theme/src/themes.js';
import '@spectrum-web-components/dropdown/sp-dropdown.js';
import '@spectrum-web-components/menu/sp-menu.js';
import '@spectrum-web-components/menu/sp-menu-item.js';
import '@spectrum-web-components/button/sp-action-button.js';
const SWC_THEME_COLOR_KEY = 'swc-docs:theme:color';
const SWC_THEME_SCALE_KEY = 'swc-docs:theme:scale';
const COLOR_FALLBACK = matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
const SCALE_MEDIUM = 'medium';
const DEFAULT_COLOR = (window.localStorage
    ? localStorage.getItem(SWC_THEME_COLOR_KEY) || COLOR_FALLBACK
    : COLOR_FALLBACK);
const DEFAULT_SCALE = (window.localStorage
    ? localStorage.getItem(SWC_THEME_SCALE_KEY) || SCALE_MEDIUM
    : SCALE_MEDIUM);
const isNarrowMediaQuery = matchMedia('screen and (max-width: 960px)');
export class LayoutElement extends LitElement {
    constructor() {
        super(...arguments);
        this.color = DEFAULT_COLOR;
        this.open = false;
        this.isNarrow = isNarrowMediaQuery.matches;
        this.scale = DEFAULT_SCALE;
        this.handleMatchMediaChange = (event) => {
            this.isNarrow = event.matches;
        };
    }
    static get styles() {
        return [layoutStyles];
    }
    toggleNav() {
        this.open = !this.open;
    }
    closeNav() {
        this.open = false;
    }
    updateColor(event) {
        this.color = event.target.value;
    }
    updateScale(event) {
        this.scale = event.target.value;
    }
    // TODO: remove this manual link relationship when
    // https://github.com/adobe/spectrum-web-components/issues/475
    // has been completed and links are natively part of the library
    onClickLabel(event) {
        const { target } = event;
        if (!target)
            return;
        const next = target.nextElementSibling;
        if (!next || next.open)
            return;
        next.click();
    }
    renderContent() {
        return html `
            <div></div>
        `;
    }
    render() {
        return html `
            <sp-theme color=${this.color} scale=${this.scale} id="app">
                <header>
                    <sp-action-button
                        quiet
                        label="Open Navigation"
                        @click=${this.toggleNav}
                    >
                        <svg
                            slot="icon"
                            viewBox="0 0 36 36"
                            focusable="false"
                            aria-hidden="true"
                            role="img"
                            width="22"
                            height="22"
                            fill="currentColor"
                        >
                            <rect
                                height="4"
                                rx="1"
                                ry="1"
                                width="28"
                                x="4"
                                y="16"
                            ></rect>
                            <rect
                                height="4"
                                rx="1"
                                ry="1"
                                width="28"
                                x="4"
                                y="6"
                            ></rect>
                            <rect
                                height="4"
                                rx="1"
                                ry="1"
                                width="28"
                                x="4"
                                y="26"
                            ></rect>
                        </svg>
                    </sp-action-button>
                </header>
                <div id="body">
                    <docs-side-nav
                        id="side-nav"
                        ?inert=${this.isNarrow && !this.open}
                        ?open=${this.open}
                        @close=${this.closeNav}
                    ></docs-side-nav>
                    <main
                        id="layout-content"
                        ?inert=${this.isNarrow && this.open}
                        role="main"
                    >
                        <div id="page">
                            <div class="manage-theme">
                                <label @click=${this.onClickLabel}>Theme</label>
                                <sp-dropdown
                                    placement="bottom"
                                    quiet
                                    value=${this.color}
                                    @change=${this.updateColor}
                                >
                                    <sp-menu>
                                        <sp-menu-item value="lightest">
                                            Lightest
                                        </sp-menu-item>
                                        <sp-menu-item value="light">
                                            Light
                                        </sp-menu-item>
                                        <sp-menu-item value="dark">
                                            Dark
                                        </sp-menu-item>
                                        <sp-menu-item value="darkest">
                                            Darkest
                                        </sp-menu-item>
                                    </sp-menu>
                                </sp-dropdown>
                                <label @click=${this.onClickLabel}>Scale</label>
                                <sp-dropdown
                                    label="Scale"
                                    placement="bottom"
                                    quiet
                                    value=${this.scale}
                                    @change=${this.updateScale}
                                >
                                    <sp-menu>
                                        <sp-menu-item value="medium">
                                            Medium
                                        </sp-menu-item>
                                        <sp-menu-item value="large">
                                            Large
                                        </sp-menu-item>
                                    </sp-menu>
                                </sp-dropdown>
                            </div>
                            ${this.renderContent()}
                        </div>
                    </main>
                </div>
            </sp-theme>
        `;
    }
    updated(changes) {
        if (changes.has('color') && window.localStorage) {
            localStorage.setItem(SWC_THEME_COLOR_KEY, this.color);
        }
        if (changes.has('scale') && window.localStorage) {
            localStorage.setItem(SWC_THEME_SCALE_KEY, this.scale);
        }
    }
    connectedCallback() {
        super.connectedCallback();
        import('./code-example');
        isNarrowMediaQuery.addEventListener('change', this.handleMatchMediaChange);
    }
    disconnectedCallback() {
        isNarrowMediaQuery.removeEventListener('change', this.handleMatchMediaChange);
    }
}
__decorate([
    property({ attribute: false })
], LayoutElement.prototype, "color", void 0);
__decorate([
    property({ type: Boolean })
], LayoutElement.prototype, "open", void 0);
__decorate([
    property({ type: Boolean, attribute: false })
], LayoutElement.prototype, "isNarrow", void 0);
__decorate([
    property({ attribute: false })
], LayoutElement.prototype, "scale", void 0);
//# sourceMappingURL=layout.js.map