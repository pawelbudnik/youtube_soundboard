// TODO: 1. Allow for multiple files to play at the same time toggle button. if off, only one file playing allowed.

let buttonsArray = [];
const container = document.getElementById('buttonContainer');
const bindButton = document.getElementById('bindButton');
const addButton = document.getElementById('addButton');
const videoInput = document.getElementById('videoInput');
let keybind = null;
let isBinding = false;
let isListening = false;
// let showIframe = false;

function initializeExtension() {
  loadButtonsFromStorage();
  bindEventListeners();
  addKeydownEventListener();
}

function addKeydownEventListener() {
  document.addEventListener('keydown', function(event) {
    const key = event.key.toLowerCase();
    const buttonObject = buttonsArray.find(button => button.keybind && button.keybind.toLowerCase() === key);

    if (buttonObject && !isBinding) {
      if (!buttonObject.isPlaying) {
        play(buttonObject);
      } else {
        pause(buttonObject);
      }

      renderButtons();
    }
  });
}

function play(buttonObject) {
  buttonObject.isPlaying = true;
  buttonObject.iframe = document.createElement('iframe');
  buttonObject.iframe.id = 'youtubeIframe';
  buttonObject.iframe.src = `https://www.youtube.com/embed/${buttonObject.videoId}?autoplay=1`;
  buttonObject.iframe.style.display = 'none';
  document.body.appendChild(buttonObject.iframe);
  renderButtons();
}

function pause(buttonObject) {
  buttonObject.isPlaying = false;
  buttonObject.iframe.src = null;
}

function renderButtons() {
  container.innerHTML = '';
  container.classList.add('button-container');

  buttonsArray.forEach(function(buttonObject, index) {
    const circleButton = document.createElement('button');
    circleButton.classList.add('circle-button');

    const keybindText = document.createElement('span');
    keybindText.innerText = buttonObject.keybind ? `# ${buttonObject.keybind}` : '';
    circleButton.appendChild(keybindText);

    const soundNameText = document.createElement('span');
    soundNameText.innerText = buttonObject.soundName;
    soundNameText.classList.add('sound-name');
    circleButton.appendChild(soundNameText);

    const playPauseButton = document.createElement('button');
    playPauseButton.classList.add('play-pause-button');
    playPauseButton.innerHTML = buttonObject.isPlaying ? `<span class="header-icon"><i class="fa-sharp fa-solid fa-circle-stop"></i></span>` : `<span class="header-icon"><i class="fab fa-youtube"></i></span>`;

    playPauseButton.addEventListener('click', function() {
      if(buttonObject.videoId == null) {
        playPauseButton.innerHTML = `<span title="The provided URL is incorrect 😥 or something else went wrong 🤷‍♂️">💥</span>`;
      } else if (!buttonObject.isPlaying) {
        play(buttonObject);
      } else {
        playPauseButton.innerHTML = `<span class="header-icon"><i class="fab fa-youtube"></i></span>`;
        pause(buttonObject);
      }
    });

    const removeButton = document.createElement('button');
    removeButton.innerText = 'X';
    removeButton.classList.add('remove-button');

    removeButton.addEventListener('click', function() {
      buttonsArray[index].iframe.src = {};
      buttonsArray.splice(index, 1);
      chrome.storage.local.set({ buttonsArray: buttonsArray });
      renderButtons();
    });

    // TODO*: Show more advanced controls with iframe for currently played sound.
    // Show iframe button
    // const showIframeButton = document.createElement('button');
    // showIframeButton.classList.add('showIframe-button');
    // showIframeButton.innerText = '🎬';

    // showIframeButton.addEventListener('click', function() {
    //   handleShowIframe(buttonObject);
    // });

    circleButton.appendChild(playPauseButton);
    circleButton.appendChild(removeButton);
    // circleButton.appendChild(showIframeButton);
    container.appendChild(circleButton);
  });
}

// TODO: show iframe controls 
// function handleShowIframe(buttonObject) {

// }

function loadButtonsFromStorage() {
  chrome.storage.local.get('buttonsArray', function(result) {
    if (result.buttonsArray) {
      buttonsArray = result.buttonsArray;
      renderButtons();
    }
  });
}

function bindEventListeners() {
  function extractVideoId(url) {
    const regExp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11}).*/;
    const match = url.match(regExp);
    return match && match.length === 2 ? match[1] : null;
  }

  // TODO: only bind to a key that is not already bound.
  function handleKeyDown(event) {
    event.preventDefault();
    const pressedKey = event.key.toLowerCase();
    
    const isKeyAlreadyBound = buttonsArray.some(button => button.keybind && button.keybind.toLowerCase() === pressedKey);
  
    if (!isKeyAlreadyBound) {
      keybind = pressedKey;
      bindButton.innerText = `Bound to "${keybind}"`;
      document.removeEventListener('keydown', handleKeyDown);
      isListening = false;
      isBinding = false;
    } else {
      alert('This 🎹 is already bound. Please 👇 another 🎹');
    }
  }  

  function handleBindClick() {
    if (!isListening) {
      bindButton.innerText = 'Press any key';
      document.addEventListener('keydown', handleKeyDown);
      isListening = true;
      isBinding = true;
    }
  }

  function handleAddButtonClick() {
    const soundName = document.getElementById('soundName').value;
    const videoId = extractVideoId(videoInput.value);

    const buttonObject = {
      soundName: soundName,
      keybind: keybind,
      videoId: videoId,
      iframe: {},
      isPlaying: false
      // showIframe: showIframe,
    };

    buttonsArray.push(buttonObject);
    chrome.storage.local.set({ buttonsArray: buttonsArray });
    renderButtons();
  }

  bindButton.addEventListener('click', handleBindClick);
  addButton.addEventListener('click', handleAddButtonClick);
}

initializeExtension();