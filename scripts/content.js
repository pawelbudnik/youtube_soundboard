let buttonsArray = [];
const container = document.getElementById('buttonContainer');
const bindButton = document.getElementById('bindButton');
const addButton = document.getElementById('addButton');
const videoInput = document.getElementById('videoInput');
let youtubeIframe = null;
let keybind = null;
let isListening = false;
let isPlaying = false;

// Function to initialize the extension
function initializeExtension() {
  loadButtonsFromStorage();
  bindEventListeners();
}

// Function to handle the play button click event
function handlePlayButtonClick(buttonObject) {
  youtubeIframe = document.createElement('iframe');
  youtubeIframe.id = 'youtubeIframe'; // Assign the ID to the iframe element
  youtubeIframe.src = `https://www.youtube.com/embed/${buttonObject.videoId}?autoplay=1`;
  youtubeIframe.style.display = 'none';
  document.body.appendChild(youtubeIframe);
}

// Function to render the buttons
function renderButtons() {
  container.innerHTML = '';
  container.classList.add('button-container');

  buttonsArray.forEach(function(buttonObject, index) {
    const circleButton = document.createElement('button');
    circleButton.classList.add('circle-button');

    const keybindText = document.createElement('span');
    keybindText.innerText = buttonObject.keybind ? `(${buttonObject.keybind})` : '';
    circleButton.appendChild(keybindText);

    const soundNameText = document.createElement('span');
    soundNameText.innerText = buttonObject.soundName;
    soundNameText.classList.add('sound-name');
    circleButton.appendChild(soundNameText);

    // play/pause button
    const playPauseButton = document.createElement('button');
    playPauseButton.classList.add('play-pause-button');
    playPauseButton.innerText = '▶️';

    playPauseButton.addEventListener('click', function() {
      togglePlay();
    });

    function togglePlay() {
      if (!isPlaying) {
        playPauseButton.innerText = '⏹';
        play();
      } else {
        playPauseButton.innerText = '▶️';
        pause();
      }
    }

    function play() {
      isPlaying = true;
      handlePlayButtonClick(buttonObject);
    }

    function pause() {
      isPlaying = false;
      youtubeIframe.src = null;
    }

    // remove button
    const removeButton = document.createElement('button');
    removeButton.innerText = 'X';
    removeButton.classList.add('remove-button');
    removeButton.addEventListener('click', function() {
      handleRemoveButtonClick(index);
    });

    circleButton.appendChild(playPauseButton);
    circleButton.appendChild(removeButton);
    container.appendChild(circleButton);
  });
}

function handleRemoveButtonClick(index) {
  buttonsArray.splice(index, 1);
  chrome.storage.local.set({ buttonsArray: buttonsArray });
  youtubeIframe.src = null;
  renderButtons();
}

// Function to load buttons from storage
function loadButtonsFromStorage() {
  chrome.storage.local.get('buttonsArray', function(result) {
    if (result.buttonsArray) {
      buttonsArray = result.buttonsArray;
      renderButtons();
    }
  });
}

// Function to bind event listeners
function bindEventListeners() {
  // Regex function to extract video ID from the URL
  function extractVideoId(url) {
    const regExp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11}).*/;
    const match = url.match(regExp);
    return match && match.length === 2 ? match[1] : null;
  }

  // Function to handle the keydown event
  function handleKeyDown(event) {
    event.preventDefault();
    keybind = event.key;
    bindButton.innerText = `Bound to "${keybind}"`;
    document.removeEventListener('keydown', handleKeyDown);
    isListening = false;
  }

  // Function to handle the button click event
  function handleBindClick() {
    if (!isListening) {
      bindButton.innerText = 'Listening for the key';
      document.addEventListener('keydown', handleKeyDown);
      isListening = true;
    }
  }

  // Function to handle the add button click event
  function handleAddButtonClick() {
    const soundName = document.getElementById('soundName').value;
    const videoId = extractVideoId(videoInput.value);

    const buttonObject = {
      soundName: soundName,
      keybind: keybind,
      videoId: videoId,
    };

    buttonsArray.push(buttonObject);
    chrome.storage.local.set({ buttonsArray: buttonsArray });
    renderButtons();
  }

  // Attach event listeners to the buttons
  bindButton.addEventListener('click', handleBindClick);
  addButton.addEventListener('click', handleAddButtonClick);
}

// Initialize the extension
initializeExtension();