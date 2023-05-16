
// Make those into an object maybe and create dynamically with custom names of bindButton1... 2... 3 etc.
let keybind = null; // Variable to store the keybind
let bindButton = document.getElementById('bindButton');
let clearButton = document.getElementById('clearButton');
let addButton = document.getElementById('addButton');
let videoInput = document.getElementById('videoInput');
let isListening = false;

// Regex function to extract video id from the url
function extractVideoId(url) {
  // Regular expression to match the video ID in the URL
  const regExp = /^(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11}).*/;

  // Extract the video ID using the regular expression
  const match = url.match(regExp);

  if (match && match.length === 2) {
    return match[1]; // Return the extracted video ID
  } else {
    return null; // Return null if the video ID could not be extracted
  }
}

// Function to handle the keydown event
function handleKeyDown(event) {
  event.preventDefault(); // Prevent any default actions of the key event
  
  const key = event.key; // Get the key that was pressed
  keybind = key; // Store the keybind in the variable
  console.log('Keybind set:', keybind); // Display the keybind in the console or perform any desired action

  // You can assign the keybind to a button's text, for example:
  bindButton.innerText = 'Keybind = ' + keybind;
  document.removeEventListener('keydown', handleKeyDown);
  isListening = false;
}

// Function to handle the button click event
function handleButtonClick() {
  if (!isListening) {
    bindButton.innerText = "listening for the key"
    document.addEventListener('keydown', handleKeyDown); // Listen for the keydown event
    console.log('Set the keybind now:');
    isListening = true;
  }
}

// Function to handle the clear button click event
function handleClearButtonClick() {
  keybind = null; // Clear the stored keybind
  
  // You can clear the button's text, for example:
  bindButton.innerText = 'Click to Set Keybind';
}

function handleAddButtonClick() {
  // let videoId = "GNJtPFXUnm4";
  let videoId = extractVideoId(videoInput.value);
  
  const iframe = document.createElement('iframe');
  iframe.src = 'https://www.youtube.com/embed/' + videoId + '?autoplay=1';
  iframe.style.display = 'none';

  console.log("Source: ", iframe.src);

  document.body.appendChild(iframe);
}

// Attach event listeners to the buttons
bindButton.addEventListener('click', handleButtonClick);
clearButton.addEventListener('click', handleClearButtonClick);
addButton.addEventListener('click', handleAddButtonClick);