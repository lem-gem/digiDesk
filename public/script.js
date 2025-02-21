document.addEventListener("DOMContentLoaded", () => {
  // References to DOM elements
  const canvas = document.getElementById("canvas");
  const addNoteButton = document.getElementById("add-note");
  const clearCanvasButton = document.getElementById("clear-canvas");
  const clearStickersButton = document.getElementById("clear-stickers");
  const uploadBgButton = document.getElementById("upload-bg");
  const bgInput = document.getElementById("background-input");
  const addStickerButton = document.getElementById("add-sticker");
  const stickerUploadInput = document.getElementById("sticker-upload");
  const stickerLibrary = document.getElementById("sticker-library");
  const studyTimerButton = document.getElementById("study-timer");

  // Utility: Make an element draggable within the canvas
  function makeDraggable(el) {
    el.style.position = "absolute";
    el.addEventListener("mousedown", mouseDownHandler);

    function mouseDownHandler(e) {
      const rect = el.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      function mouseMoveHandler(e) {
        const canvasRect = canvas.getBoundingClientRect();
        let newX = e.clientX - canvasRect.left - offsetX;
        let newY = e.clientY - canvasRect.top - offsetY;

        // Enforce canvas boundaries
        if (newX < 0) newX = 0;
        if (newY < 0) newY = 0;
        if (newX + el.offsetWidth > canvas.clientWidth)
          newX = canvas.clientWidth - el.offsetWidth;
        if (newY + el.offsetHeight > canvas.clientHeight)
          newY = canvas.clientHeight - el.offsetHeight;

        el.style.left = newX + "px";
        el.style.top = newY + "px";
      }

      function mouseUpHandler() {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
      }

      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", mouseUpHandler);
    }
  }

  // 1. Add a Sticky Note
  addNoteButton.addEventListener("click", () => {
    const note = document.createElement("div");
    note.classList.add("sticky-note");
    note.style.left = "10px";
    note.style.top = "10px";

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", () => {
      canvas.removeChild(note);
    });
    note.appendChild(deleteBtn);

    const textarea = document.createElement("textarea");
    textarea.placeholder = "Enter note...";
    note.appendChild(textarea);

    canvas.appendChild(note);
    makeDraggable(note);
  });

  // 2. Clear All Items from the Canvas (and reset background)
  clearCanvasButton.addEventListener("click", () => {
    canvas.innerHTML = "";
    canvas.style.backgroundImage = "";
  });

  // 3. Clear Only Sticker Images from the Canvas
  clearStickersButton.addEventListener("click", () => {
    const stickers = canvas.querySelectorAll("img.sticker");
    stickers.forEach((sticker) => sticker.remove());
  });

  // 4. Upload Background Image for the Canvas
  uploadBgButton.addEventListener("click", () => {
    bgInput.click();
  });
  bgInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (event) {
        canvas.style.backgroundImage = `url(${event.target.result})`;
        canvas.style.backgroundSize = "cover";
      };
      reader.readAsDataURL(file);
    }
  });

  // 5. Upload Custom Sticker(s)
  addStickerButton.addEventListener("click", () => {
    stickerUploadInput.click();
  });
  stickerUploadInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = document.createElement("img");
        img.src = event.target.result;
        img.classList.add("sticker");
        img.style.left = "10px";
        img.style.top = "10px";
        img.setAttribute("draggable", false);
        canvas.appendChild(img);
        makeDraggable(img);
      };
      reader.readAsDataURL(file);
    });
  });

  // 6. Enable Dragging Stickers from the Sticker Library to the Canvas
  stickerLibrary.querySelectorAll("img.sticker").forEach((sticker) => {
    sticker.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", sticker.src);
    });
  });
  canvas.addEventListener("dragover", (e) => {
    e.preventDefault();
  });
  canvas.addEventListener("drop", (e) => {
    e.preventDefault();
    const src = e.dataTransfer.getData("text/plain");
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.classList.add("sticker");
      const canvasRect = canvas.getBoundingClientRect();
      img.style.left = e.clientX - canvasRect.left + "px";
      img.style.top = e.clientY - canvasRect.top + "px";
      img.setAttribute("draggable", false);
      canvas.appendChild(img);
      makeDraggable(img);
    }
  });

  // 7. Study Timer Functionality
  studyTimerButton.addEventListener("click", () => {
    // Create the study timer container
    const timerContainer = document.createElement("div");
    timerContainer.classList.add("study-timer");
    timerContainer.style.left = "20px";
    timerContainer.style.top = "20px";
    timerContainer.innerHTML = `
      <div>
        <input type="number" class="timer-minutes" placeholder="Min" value="25">
        :
        <input type="number" class="timer-seconds" placeholder="Sec" value="00">
      </div>
      <button class="start-timer">Start</button>
      <div class="countdown-display">25:00</div>
      <button class="close-timer">X</button>
    `;
    canvas.appendChild(timerContainer);
    makeDraggable(timerContainer);

    const startButton = timerContainer.querySelector(".start-timer");
    const minutesInput = timerContainer.querySelector(".timer-minutes");
    const secondsInput = timerContainer.querySelector(".timer-seconds");
    const countdownDisplay = timerContainer.querySelector(".countdown-display");
    const closeButton = timerContainer.querySelector(".close-timer");

    let timerInterval;

    // Start Timer Functionality
    startButton.addEventListener("click", () => {
      clearInterval(timerInterval);
      let minutes = parseInt(minutesInput.value, 10);
      let seconds = parseInt(secondsInput.value, 10);
      let totalSeconds = minutes * 60 + seconds;
      updateDisplay(totalSeconds);

      timerInterval = setInterval(() => {
        if (totalSeconds <= 0) {
          clearInterval(timerInterval);
          countdownDisplay.textContent = "Time's up!";
          return;
        }
        totalSeconds--;
        updateDisplay(totalSeconds);
      }, 1000);
    });

    // Function to update the countdown display
    function updateDisplay(totalSeconds) {
      const displayMin = Math.floor(totalSeconds / 60);
      const displaySec = totalSeconds % 60;
      countdownDisplay.textContent =
        `${displayMin.toString().padStart(2, "0")}:${displaySec
          .toString()
          .padStart(2, "0")}`;
    }

    // Remove timer on close button click
    closeButton.addEventListener("click", () => {
      clearInterval(timerInterval);
      timerContainer.remove();
    });
  });
});
