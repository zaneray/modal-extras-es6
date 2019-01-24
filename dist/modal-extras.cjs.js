'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var $ = _interopDefault(require('jquery'));

/**
 *
 * @export
 */
function onLoad(){
  bindActions();
  closeModalOnEscape();
}

const BASE_MODAL  = '<div id="dynamic-modal" class="modal fade"><div class="modal-dialog"><div class="modal-btn-close btn-close" data-dismiss="modal"></div><div id="modal-content" class="modal-content"></div></div></div>';

/**
 * Checks to see if the modal by ID is already in the dom.  If so, uses it
 * If not, inserts after the opening body tag
 * 
 * @export
 * @param {*} html the HTML to inject in to the modal content area
 * @param {*} classname a classname to add to the modal element
 */
function generateModalTemplate(html, className){
  let modal = getModal();

  if (!modal){
    document.body.insertAdjacentHTML('afterbegin', BASE_MODAL);
    modal = getModal();
  }

  if (html) {
    modal.querySelector('.modal-content').innerHTML = html.outerHTML;
  }

  if (className) {
    className.split(' ').forEach(element => {
      if ( element && element.length){
        modal.classList.add(element);
      }
    });
  }

  // addEventlistener will not fire the hidden.bs.modal event due to how
  // bootstrap binds the events with .trigger instead of fireEvent
  $(modal).modal().on('hidden.bs.modal', function() {
    getModal().remove();
  });
}

function getModal(){
  return document.getElementById('dynamic-modal');
}

function getModalContent(){
  return getModal().querySelector('.modal-content');
}

/**
 * Finds all DOM elements with data-toggle and hooks their
 * click even to trigger the appropriate method
 * based on the data-toggle value.
 * 
 * The data-toggle value is lowercased, and has hyphens
 * removed, and then the Element is passed to that function
 * 
 * Because there could be other data-toggle's on the page
 * for accordions, etc, we make sure that we only preventDefault
 * and stopPropagation when we know we have a link that
 * we want to handle.
 */
function bindActions() {
  document.body.addEventListener('click', (evt) => {
    evt = evt || window.event;
    if (evt.target !== evt.currentTarget){
      if (!evt.target.hasAttribute('data-toggle')) return;
      const modalType = String(evt.target.dataset.toggle.replace(/-/g,'')).toLowerCase();
      console.log(modalType);
      switch (modalType){
        case 'modalhtml': {
          evt.preventDefault();
          modalhtml(evt.target);
          evt.stopPropagation();
          break;
        }
        case 'modalajax': {
          evt.preventDefault();
          modalajax(evt.target);
          evt.stopPropagation();
          break;
        }
        case 'modalvideo': {
          evt.preventDefault();
          modalvideo(evt.target);
          evt.stopPropagation();
          break;
        }
        case 'modalimage': {
          evt.preventDefault();
          modalimage(evt.target);
          evt.stopPropagation();
          break;
        }
        default:
          console.log(`${modalType} not a valid modal-extras data-toggle, skipping`);
          break;
      }
    }
  });
}

/**
 * Adds an event listener to the document to check to see
 * that the key pressed is the escape key.  If so, and if
 * the modal element is visible, it triggers a click
 * on the modals btn-close link
 */
function closeModalOnEscape() {
  document.addEventListener('keyup', (evt) => {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key == "Escape" || evt.key == "Esc");
    } else {
        isEscape = (evt.keyCode == 27);
    }
    const modal = getModal();
    if (isEscape && modal && !modal.hidden) {
      modal.querySelector('.modal-btn-close').click();
    }
  });
}

/**
 * Bind all links that open a modal from an
 * HTML element that lives in the current page
 * 
 * @param {*} el the HTML object that was clicked
 */
function modalhtml(el){
  let html = '';
  const id = el.dataset.id;
  const clazz = el.dataset.class || '';
  const targetElement = document.getElementById(id);

  if(targetElement){
    html = targetElement.cloneNode(true);
    html.id = html.id + '-modal';
  }

  generateModalTemplate(html, clazz);
}

/**
 * Content is loaded from an ajax call
 * 
 * @param {*} el the HTML object that was clicked
 */
function modalajax(el){
  let pageURL = el.href;
  const clazz = el.dataset.class || '';
  const contentId = el.dataset.id;
  const unwrap = el.dataset.unwrap || false;

  generateModalTemplate('', 'modal-ajax modal-loading ' + clazz);    

  fetch(pageURL).then(response =>{
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.text();
  }).then(html => {
    let inject = html;
    if(typeof contentId !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      try {
        inject = unwrap ? doc.querySelector(contentId).innerHTML : doc.querySelector(contentId).outerHTML;
      }
      catch(e){
        inject = `id='${contentId}' was not found in the response from ${pageURL}`;
      }
    }
    getModalContent().innerHTML = inject;
    getModal().classList.remove('modal-loading');
  })
  .catch(err => {
    console.log(err);
    alert('there was an error loading the URL');
    getModal().remove();
  });

}

/**
 * Content is a video coming either from YouTube  or Vimeo. 
 *  
* @param {*} el the HTML object that was clicked
 */
function modalvideo(el) {
  const clazz = el.dataset.class || '';
  const videoSource = el.dataset.source;
  const videoKey = el.dataset.key;
  let videoHTML, embedURL;

  switch (videoSource.toLowerCase()) {
    case 'vimeo':
      embedURL = `https://player.vimeo.com/video/${videoKey}?autoplay=1&title=0&byline=0&portrait=0`;
      break;
    case 'youtube':
      embedURL = `https://www.youtube.com/embed/${videoKey}?rel=0&amp;showinfo=0&autoplay=1`;
      break;
    default:
      alert(`The video source '${videoKey}' is not valid (must be vimeo or youtube)`);
  }

  videoHTML = `<div class="modal-video-wrapper"><iframe src="${embedURL}" class="modal-video-iframe" width="720" height="405" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div>`;
  const videoElement = document.createElement('div');
  videoElement.innerHTML = videoHTML;
  generateModalTemplate(videoElement.firstChild, 'modal-video ' + clazz);
}

/**
 * Content is image(s) on the page or
 * coming from Instagram
 * 
 * @param {*} el the HTML object that was clicked
 */
function modalimage(el) {
  const $this = $(el);
  const clazz = el.dataset.class || '';
  const img = new Image();
  img.title = el.title || '';
  img.id = 'modal-image';
  img.classList.add('modal-image');
  img.addEventListener('load', function() {
    getModal().classList.remove('modal-loading');
  }, false);
  img.src = el.href;

  generateModalTemplate(img, 'modal-image-wrapper modal-loading ' + clazz);
  
  /* TODO add more functionality */

}

exports.onLoad = onLoad;
exports.generateModalTemplate = generateModalTemplate;
