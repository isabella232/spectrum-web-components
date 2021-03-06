## Description

Use an `<sp-asset>` element to visually represent a file, folder or image in your application. File and folder representations will center themselves horizontally and vertically in the space provided to the element. Images will be contained to the element, growing to the element's full height while centering itself within the width provided.

### Installation

[![See it on NPM!](https://img.shields.io/npm/v/@spectrum-web-components/asset?style=for-the-badge)](https://www.npmjs.com/package/@spectrum-web-components/asset)
[![How big is this package in your project?](https://img.shields.io/bundlephobia/minzip/@spectrum-web-components/asset?style=for-the-badge)](https://bundlephobia.com/result?p=@spectrum-web-components/asset)

```
npm install @spectrum-web-components/asset

# or

yarn add @spectrum-web-components/asset
```

## Example

```html
<sp-asset style="height: 128px">
    <img src="https://placedog.net/500/500" alt="Demo Image" />
</sp-asset>
```

### File

```html
<sp-asset variant="file"></sp-asset>
```

### Folder

```html
<sp-asset variant="folder"></sp-asset>
```
