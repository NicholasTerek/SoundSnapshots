//using huggingface API
const apiKey = "MY API KEY";

const maxImages = 4; // Number of images to generate for each prompt
let selectedImageNumber = null;

// Function to generate a random number between min and max (inclusive)
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to disable the generate button during processing
function disableGenerateButton() {
    document.getElementById("generate").disabled = true;
}

// Function to enable the generate button after process
function enableGenerateButton() {
    document.getElementById("generate").disabled = false;
}

// Function to clear image grid
function clearImageGrid() {
    const imageGrid = document.getElementById("image-grid");
    imageGrid.innerHTML = "";
}

// Function to generate images
async function generateImages(input) {
    disableGenerateButton();
    clearImageGrid();

    const loading = document.getElementById("loading");
    loading.style.display = "block";

    const imageUrls = [];

    for (let i = 0; i < maxImages; i++) {
        // Generate a random number between 1 and 10000 and append it to the prompt
        const randomNumber = getRandomNumber(1, 10000);
        const prompt = `${input} ${randomNumber}`;
        // We added random number to prompt to create different results
        const response = await fetch(
            "https://api-inference.huggingface.co/models/prompthero/openjourney",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({ inputs: prompt }),
            }
        );

        if (!response.ok) {
            alert("Failed to generate image!");
        }

        const blob = await response.blob();
        const imgUrl = URL.createObjectURL(blob);
        imageUrls.push(imgUrl);

        const img = document.createElement("img");
        img.src = imgUrl;
        img.alt = `art-${i + 1}`;
        img.onclick = () => downloadImage(imgUrl, i);
        document.getElementById("image-grid").appendChild(img);
    }

    loading.style.display = "none";
    enableGenerateButton();

    selectedImageNumber = null; // Reset selected image number
}

function downloadImage(imgUrl, imageNumber) {
    const link = document.createElement("a");
    link.href = imgUrl;
    // Set filename based on the selected image
    link.download = `image-${imageNumber + 1}.jpg`;
    link.click();
}

const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('generate');
const outputDiv = document.getElementById('user-prompt');

// Declare variables to hold the recognition and recording information
let recognition;
let recordingInProgress = false;
let savedRecording = '';

// Check if the browser supports the Web Speech API
if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
  // Create an instance of the recognition object using the available API
  recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  // Configure recognition settings
  recognition.continuous = true; 
  recognition.interimResults = true; 
  
  // Event handler when recognition starts
  recognition.onstart = () => {
    savedRecording = ''; 
    outputDiv.innerHTML = 'Start Speaking...'; 
    startButton.disabled = true; 
    stopButton.disabled = false; 
    recordingInProgress = true; 
  };

  // Event handler when recognition results are available
  recognition.onresult = (event) => {
    let transcript = ''; 
    for (const result of event.results) {
      transcript += result[0].transcript; 
    }
    savedRecording = transcript; 
    outputDiv.innerHTML = transcript; // Update the displayed text with the transcript
  };

  // Event handler when recognition ends
  recognition.onend = () => {
    if (outputDiv.innerHTML === 'Start Speaking...'){
      outputDiv.innerHTML = 'Recording over..'; // Update the displayed text only if no voice is detected
    }
    startButton.disabled = false; 
    stopButton.disabled = true; 
    recordingInProgress = false; 
  };

  // Event handler for recognition errors
  recognition.onerror = (event) => {
    outputDiv.innerHTML = 'Error occurred: ' + event.error; // Display error message
  };

} else {
  // Display a message if the browser does not support the Web Speech API
  outputDiv.innerHTML = 'Web Speech API is not supported by this browser.';
  startButton.disabled = true; 
  stopButton.disabled = true;
}

// Event listener for the start button click
startButton.addEventListener('click', () => {
  recognition.start(); 
});

// Event listener for the stop button click
stopButton.addEventListener('click', () => {
  recognition.stop(); 
  generateImages(savedRecording); 
});
