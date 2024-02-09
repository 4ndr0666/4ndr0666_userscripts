// ==UserScript==
// @name         Pixeldrain Media Viewer
// @namespace    Magof - pixeldrain-media-viewer
// @version      1.0
// @description  The "Pixeldrain Media Viewer" script enhances the user experience on the "Pixeldrain.com" website by adding features that make it easier to view single videos and media within albums, improving the convenience of accessing media for users.
// @match        https://*.pixeldrain.com/*
// @author       Magof
// @downloadURL https://update.greasyfork.org/scripts/475545/Pixeldrain%20Media%20Viewer.user.js
// @updateURL https://update.greasyfork.org/scripts/475545/Pixeldrain%20Media%20Viewer.meta.js
// ==/UserScript==


(function () {
  'use strict';

  function getContentAfterSlash(type) {
    const currentUrl = window.location.href;
    const startIndex = currentUrl.indexOf(type) + type.length;
    return currentUrl.substring(startIndex);
  }

  function createModal(contentType, fileUrl) {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    document.body.appendChild(modal);

    let contentElement;

    if (contentType.startsWith('image')) {
      contentElement = document.createElement('img');
    } else if (contentType.startsWith('video')) {
      contentElement = document.createElement('video');
      contentElement.controls = true;
    } else {
      contentElement = document.createElement('p');
      contentElement.textContent = 'Tipo de arquivo não suportado';
    }

    contentElement.src = fileUrl;
    contentElement.style.maxWidth = '80%';
    contentElement.style.maxHeight = '80%';
    modal.appendChild(contentElement);

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Fechar';
    closeButton.style.marginTop = '10px';
    closeButton.style.padding = '10px 20px';
    closeButton.style.backgroundColor = 'red';
    closeButton.style.color = 'white';
    closeButton.style.border = 'none';
    closeButton.style.cursor = 'pointer';
    closeButton.addEventListener('click', function () {
      document.body.removeChild(modal);
      if (contentType.startsWith('video')) {
        contentElement.pause();
        contentElement.src = '';
      }
    });
    modal.appendChild(closeButton);
  }

  function addPlayButton() {
    const descriptionDiv = document.querySelector('.description.svelte-16pxrp4');
    if (descriptionDiv) {
      const playButton = document.createElement('button');
      const playIcon = document.createElement('i');
      playIcon.textContent = 'play';
      playButton.appendChild(playIcon);

      playButton.style.backgroundColor = 'blue';
      playButton.style.color = 'white';
      playButton.style.border = 'none';
      playButton.style.padding = '5px 10px';

      const brElement = descriptionDiv.querySelector('br');
      if (brElement) {
        brElement.parentNode.insertBefore(playButton, brElement.nextSibling);
      } else {
        descriptionDiv.appendChild(playButton);
      }

      playButton.addEventListener('click', function () {
        const content = getContentAfterSlash('/u/');
        const fileUrl = `https://pixeldrain.com/api/file/${content}`;
        createModal('video', fileUrl);
      });
    }
  }

  function fetchInfoFromAPI() {
    const currentUrl = window.location.href;
    if (currentUrl.includes('/l/')) {
      const content = getContentAfterSlash('/l/');
      const apiUrl = `https://pixeldrain.com/api/list/${content}`;

      fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
          if (data.files && Array.isArray(data.files)) {
            const fileData = data.files.map(file => ({
              id: file.id,
              mimeType: file.mime_type,
            }));

            const aTags = document.querySelectorAll('.gallery.svelte-1arosya a');
            aTags.forEach((a, index) => {
              a.addEventListener('click', function (event) {
                event.preventDefault();
                if (index < fileData.length) {
                  const fileInfo = fileData[index];
                  const fileUrl = `https://pixeldrain.com/api/file/${fileInfo.id}`;
                  createModal(fileInfo.mimeType, fileUrl);
                }
              });
            });
          }
        })
        .catch(error => {
          console.error('Erro ao acessar a API:', error);
        });
    }
  }

  if (window.location.href.includes('/u/')) {
    addPlayButton();
  }

  fetchInfoFromAPI();
})();
