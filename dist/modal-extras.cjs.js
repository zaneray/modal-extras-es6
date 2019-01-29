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

  document.removeEventListener('click.modal');
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
          modalHtml(evt.target);
          evt.stopPropagation();
          break;
        }
        case 'modalajax': {
          evt.preventDefault();
          modalAjax(evt.target);
          evt.stopPropagation();
          break;
        }
        case 'modalvideo': {
          evt.preventDefault();
          modalVideo(evt.target);
          evt.stopPropagation();
          break;
        }
        case 'modalimage': {
          evt.preventDefault();
          modalImage(evt.target);
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
function modalHtml(el){
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
function modalAjax(el){
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
function modalVideo(el) {
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
 * Content is image(s) by a static img src or 
 * coming from Instagram
 * 
 * @param {*} el the HTML object that was clicked
 */
function modalImage(el) {
  const $this = $(el);
  const clazz = el.dataset.class || '';

  // The element we'll load in to the modal
  let inject;

  const img = new Image();
  img.title = el.title || '';
  img.id = 'modal-image';
  img.classList.add('modal-image');

  // When the image is done loading, remove the modal-loading class
  img.addEventListener('load', function() {
    getModal().classList.remove('modal-loading');
  }, false);

  // set the scr, which will fire the Load event on the image.
  img.src = el.href;

  // If we have data-link wrap the img with an anchor
  if ('undefined' !== typeof(el.dataset.link)) {    
    inject = document.createElement('a');
    inject.href = el.dataset.link;
    inject.classList.add('modal-image-link');
    inject.target = '_blank';
    inject.appendChild(img);
  }
  else {
    inject = img;
  }

  // Load the modal
  generateModalTemplate(inject, 'modal-image-wrapper modal-loading ' + clazz);
  
  // If we're an instagram image, add the user/description content
  if ('undefined' !== typeof(el.dataset.instagram)){
    const htmlText = `<div class='modal-image-instagram-container'><div class='user-section'><img src='${el.dataset.userphoto}' class='instagram-userphoto' /><div class='user-info'><span class='username'>${el.dataset.username}</span><span class='location'>${el.dataset.location}</span></div><a href=${el.dataset.link} class='btn btn-sm btn-instagram' target='_blank'>Follow</a></div><span class='image-likes'>${el.dataset.likes}</span><span class='image-caption'>${el.dataset.caption}</span></div>`;
    getModalContent().insertAdjacentHTML('beforeend', htmlText);
  }
  // else, if we have a caption, add that HTML instead
  else if ('undefined' !== typeof(el.dataset.caption)){
    const htmlText = `<div class='modal-image-caption-wrapper'><span class='modal-image-caption'>${el.dataset.caption}</span></div>`;
    getModalContent().insertAdjacentHTML('beforeend', htmlText);
  }

  // If we're a gallery, load up the rest of the images, inject
  // the arrows and bind the click/swipe events.
  if ('undefined' !== typeof(el.dataset.gallery)) {
    const galleryName = el.dataset.gallery;
    const galleryElements = document.querySelectorAll(`[data-gallery='${galleryName}']`);
    const galleryElementCount = galleryElements.length - 1;
    const galleryImageArray = [];
    const galleryCaptionArray = [];
    const galleryLinkArray = [];
    let currentImageLink = el.href;

    galleryElements.forEach(element => {
      galleryImageArray.push(element.href);
      galleryCaptionArray.push(element.dataset.caption);
      galleryLinkArray.push(element.dataset.link);
    });

    getModalContent().insertAdjacentHTML('beforeend', "<span class='global-arrow prev-arrow'></span><span class='global-arrow next-arrow'></span>");

    const goToNextImage = function(direction){
      const modalImage = getModalContent().querySelector(".modal-image");
      let currentImageSrc = modalImage.src;
      let currentImageIndex = galleryImageArray.indexOf(currentImageSrc);
      let nextImageIndex = 0;

      switch (direction){
        case 'next': {
          nextImageIndex = currentImageIndex + 1;
          if(nextImageIndex > galleryElementCount){
            nextImageIndex = 0;
          }
        }
        default: {
          nextImageIndex = currentImageIndex - 1;
          if(nextImageIndex < 0){
            nextImageIndex = galleryElementCount;
          }
        }
      }

      const nextImageSrc = galleryImageArray[nextImageIndex];
      const nextImageCaption = galleryCaptionArray[nextImageIndex];
      const nextImageLink = galleryLinkArray[nextImageIndex];

      // check if next image has caption and/or link, and switch content accordingly
      updateModalImageCaption(nextImageCaption);
      updateModalImageLink(nextImageLink);

      // swap out with the new image source
      modalImage.src = nextImageSrc;
    };

    document.body.addEventListener('click', (event) => {
      if (event.target !== event.currentTarget){
        if (event.target.classList.contains('next-arrow')){
          goToNextImage('next');
        }
        else if (event.target.classList.contains('prev-arrow')){
          goToNextImage('prev');
        }
      } 
    });

    // can we do this without jQuery plugin??
    try {
      $('.modal-content').swipe({
        swipeLeft:function(){
            goToNextImage('next');    
        },
        swipeRight:function(){
            goToNextImage('prev');
        }
      });
    }
    catch(e){
      console.error(e);
    }

  }

}

function updateModalImageCaption( caption ){
  const captionWrapper = getModalContent().querySelector('.modal-image-caption-wrapper');
  if ('undefined' !== typeof(caption)) {
    if ( captionWrapper ) {
      captionWrapper.text = caption;
    }
    else {
      const htmlText = `<div class='modal-image-caption-wrapper'><span class='modal-image-caption'>${caption}</span></div>`;
      getModalContent().insertAdjacentHTML('beforeend', htmlText);
    }
  }
  else if(captionWrapper){
    captionWrapper.remove();
  }
}

function updateModalImageLink( link ){
  const imageLink = getModalContent().querySelector('.modal-image-link');
  if ('undefined' !== typeof(link)) {
    if ( imageLink ) {
      imageLink.href = link;
    }
    else {
      const imageNode = getModalContent().querySelector('.modal-image');
      const newLink = document.createElement('a');
      newLink.href = link;
      newLink.classList.add('modal-image-link');
      newLink.target = '_blank';
      imageNode.parentNode.insertBefore(newLink, imageNode);
      newLink.appendChild(imageNode);
    }
  }
  else if(imageLink){
    const modalImage = imageLink.firstChild;
    imageLink.replaceWith(modalImage);
  }
}

exports.onLoad = onLoad;
exports.generateModalTemplate = generateModalTemplate;
