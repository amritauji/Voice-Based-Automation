const nav = document.querySelector(".nav"),
  searchIcon = document.querySelector("#searchIcon"),
  navOpenBtn = document.querySelector(".navOpenBtn"),
  navCloseBtn = document.querySelector(".navCloseBtn");

searchIcon.addEventListener("click", () => {
  nav.classList.toggle("openSearch");
  nav.classList.remove("openNav");
  if (nav.classList.contains("openSearch")) {
    return searchIcon.classList.replace("uil-search", "uil-times");
  }
  searchIcon.classList.replace("uil-times", "uil-search");
});

navOpenBtn.addEventListener("click", () => {
  nav.classList.add("openNav");
  nav.classList.remove("openSearch");
  searchIcon.classList.replace("uil-times", "uil-search");
});

navCloseBtn.addEventListener("click", () => {
  nav.classList.remove("openNav");
});

// Enable delete for existing rows
document.querySelectorAll(".delete-btn").forEach((button) => {
  button.addEventListener("click", function () {
    this.parentElement.parentElement.remove();
  });
});

// Voice Recognition Logic
if ("webkitSpeechRecognition" in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  let capturedText = "";

  function startListening() {
    recognition.start();
    console.log("Listening...");
    document.getElementById("output").innerText = "Listening...";
  }

  recognition.onresult = (event) => {
    capturedText = event.results[0][0].transcript.toLowerCase();
    console.log("Captured:", capturedText);
    document.getElementById("output").innerText = "Captured: " + capturedText;

    const parsedData = parseSpeech(capturedText);
    if (parsedData) {
      document.getElementById("saveBtn").disabled = false;
      document.getElementById("discardBtn").disabled = false;
    }
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    document.getElementById("output").innerText = "Error: " + event.error;
  };

  function parseSpeech(text) {
    const regex =
      /(.+?) brand (.+?) category (.+?) size (.+?) colou?r (.+?) quantity (\d+|one|two|three|four|five|six|seven|eight|nine|ten) price (\d+(\.\d+)?)/;
    const match = text.match(regex);

    if (match) {
      // Map the spoken category to a valid ENUM value
      const categoryMap = {
        "men's": "Men's",
        mens: "Men's",
        unisex: "Unisex",
        "women's": "Women's",
        womens: "Women's",
      };

      // Map the spoken size to a valid ENUM value
      const sizeMap = {
        s: "S",
        small: "S",
        m: "M",
        medium: "M",
        l: "L",
        large: "L",
        xl: "XL",
        "extra large": "XL",
      };

      const category = categoryMap[match[3].toLowerCase()] || "Unisex"; // Default to 'Unisex' if no match
      const size = sizeMap[match[4].toLowerCase()] || "M"; // Default to 'M' if no match

      return {
        product_name: match[1].trim(),
        brand_name: match[2].trim(),
        category: category, // Use the mapped category
        size: size, // Use the mapped size
        color: match[5].trim(),
        quantity: parseInt(match[6]),
        price: parseFloat(match[7]),
      };
    } else {
      alert("Invalid format! Please follow the correct sequence.");
      return null;
    }
  }

  function saveText() {
    if (!capturedText) return alert("No text to save!");

    const parsedData = parseSpeech(capturedText);
    if (!parsedData) return;

    console.log("Parsed data:", parsedData); // Log the parsed data

    fetch("http://localhost:4000/save-text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsedData),
    })
      .then((response) => response.json())
      .then((data) => {
        alert(data.message);
        resetUI();
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("Failed to save data. Check the console for details.");
      });
  }

  function discardText() {
    resetUI();
  }

  function resetUI() {
    document.getElementById("output").innerText =
      "Your speech will appear here...";
    document.getElementById("saveBtn").disabled = true;
    document.getElementById("discardBtn").disabled = true;
    capturedText = "";
  }

  // Add event listeners
  document
    .getElementById("voiceOrderBtn")
    .addEventListener("click", startListening);
  document.getElementById("saveBtn").addEventListener("click", saveText);
  document.getElementById("discardBtn").addEventListener("click", discardText);
} else {
  alert("Your browser does not support Speech Recognition.");
}

function fetchAndDisplayProducts() {
  fetch("http://localhost:4000/get-products")
    .then((response) => response.json())
    .then((data) => {
      const table = document.getElementById("clothingTable");
      table.innerHTML = ""; // Clear existing rows

      data.forEach((product) => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>${product.product_name}</td>
          <td>${product.brand_name}</td>
          <td>${product.category}</td>
          <td>${product.size}</td>
          <td>${product.color}</td>
          <td>${product.quantity}</td>
          <td>${product.price}</td>
          <td>${product.date_of_order || "N/A"}</td>
          <td><span class="status completed">Completed</span></td>
          <td><button class="delete-btn">Delete</button></td>
        `;
        table.appendChild(newRow);

        // Attach Delete Functionality to New Button
        newRow
          .querySelector(".delete-btn")
          .addEventListener("click", function () {
            deleteProduct(product.id); // Call a function to delete the product
          });
      });
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
    });
}

// Function to delete a product
function deleteProduct(productId) {
  fetch(`http://localhost:4000/delete-product/${productId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      fetchAndDisplayProducts(); // Refresh the table after deletion
    })
    .catch((error) => {
      console.error("Error deleting product:", error);
    });
}

// Fetch and display products when the page loads
document.addEventListener("DOMContentLoaded", fetchAndDisplayProducts);
