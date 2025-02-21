document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("canvas");
  const addNoteButton = document.getElementById("add-note");
  const clearCanvasButton = document.getElementById("clear-canvas");
  const clearStickersButton = document.getElementById("clear-stickers");
  const uploadBgButton = document.getElementById("upload-bg");
  const bgInput = document.getElementById("background-input");
  const addStickerButton = document.getElementById("add-sticker");
  const stickerUploadInput = document.getElementById("sticker-upload");
  const stickerLibrary = document.getElementById("sticker-library");

  //Utility: Make an element draggable within the canvas
  function makeDraggable(el) {
    el.style.position = "absolute";
    el.addEventListener("mousedown", mouseDownHandler);

    function mouseDownHandler(e) {
      //Get current mouse position relative to the element
      const rect = el.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      function mouseMoveHandler(e) {
        const canvasRect = canvas.getBoundingClientRect();
        let newX = e.clientX - canvasRect.left - offsetX;
        let newY = e.clientY - canvasRect.top - offsetY;

        // Optionally enforce boundaries
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

  //Add a sticky note to the canvas
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

  //Clear all items from the canvas (and reset background)
  clearCanvasButton.addEventListener("click", () => {
    canvas.innerHTML = "";
    canvas.style.backgroundImage = "";
  });

  //Clear only sticker images from the canvas
  clearStickersButton.addEventListener("click", () => {
    const stickers = canvas.querySelectorAll("img.sticker");
    stickers.forEach((sticker) => sticker.remove());
  });

  //Upload a background image for the canvas
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

  //Upload custom sticker(s) to add to the canvas
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
        // Position sticker at a default location
        img.style.left = "10px";
        img.style.top = "10px";
        img.setAttribute("draggable", false);
        canvas.appendChild(img);
        makeDraggable(img);
      };
      reader.readAsDataURL(file);
    });
  });

  //Enable dragging stickers from the sticker library to the canvas
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
      // Position the sticker at the drop location
      const canvasRect = canvas.getBoundingClientRect();
      img.style.left = e.clientX - canvasRect.left + "px";
      img.style.top = e.clientY - canvasRect.top + "px";
      img.setAttribute("draggable", false);
      canvas.appendChild(img);
      makeDraggable(img);
    }
  });
});
