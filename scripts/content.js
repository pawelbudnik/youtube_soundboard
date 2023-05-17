let buttonsArray = [];
const container = document.getElementById('buttonContainer');
const bindButton = document.getElementById('bindButton');
const addButton = document.getElementById('addButton');
const videoInput = document.getElementById('videoInput');
let keybind = null;
let isBinding = false;
let isListening = false;
// let showIframe = false;

// Initialize the extension
function initializeExtension() {
  loadButtonsFromStorage();
  bindEventListeners();
}

// Render the buttons
function renderButtons() {
  container.innerHTML = '';
  container.classList.add('button-container');

  buttonsArray.forEach(function(buttonObject, index) {
    console.log("bo: " , buttonObject);
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
      if (!buttonObject.isPlaying) {
        playPauseButton.innerHTML = `<span class="header-icon"><i class="fa-sharp fa-solid fa-circle-stop"></i></span>`;
        play();
      } else {
        playPauseButton.innerHTML = `<span class="header-icon"><i class="fab fa-youtube"></i></span>`;
        pause();
      }
    });

    // remove button
    const removeButton = document.createElement('button');
    removeButton.innerText = 'X';
    removeButton.classList.add('remove-button');

    removeButton.addEventListener('click', function() {
      buttonsArray[index].iframe.src = {};
      buttonsArray.splice(index, 1);
      chrome.storage.local.set({ buttonsArray: buttonsArray });

      console.log("button is playing before: ", buttonsArray);
      console.log("index " , index);
      
      // buttonsArray[index].buttonObject = false;



      renderButtons();

    });

    // TODO: Show more advanced controls with iframe for currently played sound.
    // Show iframe button
    // const showIframeButton = document.createElement('button');
    // showIframeButton.classList.add('showIframe-button');
    // showIframeButton.innerText = '🎬';

    // showIframeButton.addEventListener('click', function() {
    //   handleShowIframe(buttonObject);
    // });

    function play() {
      buttonObject.isPlaying = true;
      buttonObject.iframe = document.createElement('iframe');
      buttonObject.iframe.id = 'youtubeIframe'; // Assign the ID to the iframe element
      buttonObject.iframe.src = `https://www.youtube.com/embed/${buttonObject.videoId}?autoplay=1`;
      buttonObject.iframe.style.display = 'none'; // showIframe ? 'true' : 'none'
      document.body.appendChild(buttonObject.iframe);
    }

    function pause() {
      buttonObject.isPlaying = false;
      buttonObject.iframe.src = null;
    }

    circleButton.appendChild(playPauseButton);
    circleButton.appendChild(removeButton);
    // circleButton.appendChild(showIframeButton);
    container.appendChild(circleButton);
  });
}

// TODO: show iframe controls 
// function handleShowIframe(buttonObject) {

// }

// Load buttons from storage
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
      bindButton.innerText = 'Press any key';
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
      iframe: {},
      isPlaying: false
      // showIframe: showIframe,
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