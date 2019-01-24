# @zaneray/modal-extras


## Getting Started

Modal Extras can be used in an project that implements Bootstrap modal

```
yarn add @zaneray/modal-extras
```

and then import the functions you wish to use through ES6 imports:

```
import * as modalextras from '@zaneray/modal-extras`;
```

If you prefer not to use a package manager, you can download the latest version of Modal Extras and include it in your project manually from the following links:

- [modal-extras.js](http://unpkg.com/@zaneray/modal-extras@latest/dist/modal-extras.js)
- [theme-cart.min.js](http://unpkg.com/@zaneray/modal-extras@latest/dist/modal-extras.min.js)

These files make Modal Extras accessible via the `Zaneray.bootstrap.modal` global variable.

## Browser Support

Modal Extras uses two APIs not available to legacy browsers, Fetch and Promise. If you wish to support legacy browsers, make sure you add the following dependencies to your project:

```
yarn add unfetch es6-promise
```

and then import them before you import Modal Extras:

```js
// Only need to import these once
import 'unfetch/polyfill';
import 'es6-promise/auto';

// Import @zaneray/modal-extras anywhere you need it
import * as modalextras from '@zaneray/modal-extras';
```

## Methods

### onLoad()

Finds all data-toggle elements on the page and binds them to the proper methods based on their value

```js
modalextras.onLoad();
```

### generateModalTemplate(html, clazz)

Injects the dynamic-modal HTML wrapper to the begining of the body and binds a modal.bs.hide method to remove it from the DOM

```js
modalextras.generateModalTemplate('<div>content</div>', '');
```

## Binding Usage

### Inline Html

Auto bind a link on the page to load content on the page to a modal.  To avoid duplicate DOM id's on the page
when the content is copied in to the modal, the parent element ID is changed to [id]-modal.  If you're relying
on this id for styling, ensure you also include this selector in your css.

```html
<a href="#" data-toggle="modal-html" data-id="id-1234">Open HTML modal by ID</a>
<div id="id-1234">Content to load in a modal</div>
```

### AJAX Content
By default you can specify a URL and all of that URL will be loaded to the page. Specify data-toggle of modal-ajax 
and the script will grab the URL in the href. This works fine for snippets of HTML but in demo you can see that it 
loads all of the image from /includes/ajax.html including the header and footer.

```html
<a href="includes/ajax.html" data-toggle="modal-ajax">Open Ajax Modal</a>
```

#### Load a page with an optional selector

Optionally you can specify an id and the script will load the whole page and display the results specified in the data-id selector.

```html
<a href="includes/ajax.html" data-toggle="modal-ajax" data-id="wrapper">Open Ajax Modal and inject with Element id="wrapper" from response</a>
```

### Modal Images

Specify a data-toggle attribute of modal-image to load the image in the href of an anchor link in a modal window.

```html
<a href="http://www.zaneray.com/proto/images/flatheadsunset.jpg" data-toggle="modal-image">Open horizontal Image Modal </a>
```

### Modal Videos

Specify a data-toggle of modal-video to dynamically load the video. It is required to specify a data-key as well as a data-source which at the moment only includes Youtube and Vimeo. It is recommended to make the href a link to the URL of the video for Accessbility reasons.

```html
<a href="https://vimeo.com/74980365" data-key="74980365" data-source="Vimeo" data-toggle="modal-video">Open Vimeo Video</a>
```

### Additional Classes

If you need to override the styling of a modal window you can always specify a custom class with data-class attribute.

```html
<a href="http://www.zaneray.com/proto/images/flatheadsunset.jpg" data-toggle="modal-image" data-class="my-additional-class">Open Image with Custom Class </a>
```

### Closing the modal window

Pressing escape will close the Modal window for all dynamically created modal windows not including standard inline Bootstrap Modals. Click outside the modal
window will also close the modal.

The hidden.bs.modal event is bound to remove the modal from the DOM upon close