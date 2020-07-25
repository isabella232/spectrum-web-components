import { toHtmlTemplateString } from '../src/utils/templates.js';
const guideDocs = require.context('../guides', true, /\.md$/);
export const GuideDocs = new Map();
for (const key of guideDocs.keys()) {
    const componentName = /([a-zA-Z-]+)\.md$/.exec(key)[1];
    const templateString = toHtmlTemplateString(guideDocs(key));
    GuideDocs.set(componentName, templateString);
}
//# sourceMappingURL=index.js.map