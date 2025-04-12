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
// Export Table Function (CSV only)
document.getElementById('exportTableBtn').addEventListener('click', exportToCSV);

function exportToCSV() {
  const rows = document.querySelectorAll("#clothingTable tr");
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Add headers
  const headers = [];
  document.querySelectorAll("#clothingTable th").forEach(th => {
    headers.push(th.textContent);
  });
  csvContent += headers.join(",") + "\r\n";
  
  // Add data rows
  rows.forEach(row => {
    const rowData = [];
    row.querySelectorAll("td").forEach((cell, index) => {
      if (index < 9) { // Skip the action column
        rowData.push(cell.textContent);
      }
    });
    csvContent += rowData.join(",") + "\r\n";
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `orders_${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Edit Table Functionality
let isEditMode = false;
let originalData = {};

document.getElementById('editTableBtn').addEventListener('click', toggleEditMode);

function toggleEditMode() {
  isEditMode = !isEditMode;
  const table = document.getElementById("clothingTable");
  const editBtn = document.getElementById("editTableBtn");
  
  if (isEditMode) {
    // Store original data
    document.querySelectorAll("#clothingTable tr").forEach((row, rowIndex) => {
      originalData[rowIndex] = {};
      row.querySelectorAll("td:not(:last-child)").forEach((cell, cellIndex) => {
        originalData[rowIndex][cellIndex] = cell.textContent;
      });
    });
    
    table.classList.add("editable");
    editBtn.innerHTML = '<i class="uil uil-save"></i> Save Changes';
    editBtn.classList.remove('edit-btn');
    editBtn.classList.add('save-btn');
    
    // Make cells editable
    document.querySelectorAll("#clothingTable td:not(:last-child)").forEach(cell => {
      cell.contentEditable = true;
      cell.style.backgroundColor = "#fffde7";
    });
  } else {
    table.classList.remove("editable");
    editBtn.innerHTML = '<i class="uil uil-edit"></i> Edit Table';
    editBtn.classList.add('edit-btn');
    editBtn.classList.remove('save-btn');
    
    // Make cells non-editable
    document.querySelectorAll("#clothingTable td:not(:last-child)").forEach(cell => {
      cell.contentEditable = false;
      cell.style.backgroundColor = "";
    });
    
    // Save changes to database
    saveTableChanges();
  }
}

function saveTableChanges() {
  const rows = document.querySelectorAll("#clothingTable tr");
  const updates = [];
  
  rows.forEach((row, rowIndex) => {
    const rowData = {};
    const cells = row.querySelectorAll("td:not(:last-child)");
    
    // Get product ID from data attribute (you'll need to add this when creating rows)
    const productId = row.dataset.productId;
    
    cells.forEach((cell, cellIndex) => {
      const columnName = getColumnName(cellIndex);
      if (columnName && cell.textContent !== originalData[rowIndex][cellIndex]) {
        rowData[columnName] = cell.textContent;
      }
    });
    
    if (Object.keys(rowData).length > 0 && productId) {
      updates.push({ id: productId, changes: rowData });
    }
  });
  
  // Send updates to server
  if (updates.length > 0) {
    fetch('http://localhost:4000/update-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates })
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      fetchAndDisplayProducts(); // Refresh the table
    })
    .catch(error => {
      console.error('Error updating products:', error);
      alert('Failed to save changes. Please try again.');
      fetchAndDisplayProducts(); // Refresh to restore original data
    });
  } else {
    alert('No changes detected.');
  }
}

function getColumnName(index) {
  const columns = [
    'product_name', 'brand_name', 'category', 
    'size', 'color', 'quantity', 'price', 
    'date_of_order', 'status'
  ];
  return columns[index] || null;
}

// Update your fetchAndDisplayProducts function to include data-product-id
function fetchAndDisplayProducts() {
  fetch("http://localhost:4000/get-products")
    .then((response) => response.json())
    .then((data) => {
      const table = document.getElementById("clothingTable");
      table.innerHTML = ""; // Clear existing rows

      data.forEach((product) => {
        const newRow = document.createElement("tr");
        newRow.dataset.productId = product.id; // Add product ID as data attribute
        newRow.innerHTML = `
          <td>${product.product_name}</td>
          <td>${product.brand_name}</td>
          <td>${product.category}</td>
          <td>${product.size}</td>
          <td>${product.color}</td>
          <td>${product.quantity}</td>
          <td>${product.price}</td>
          <td>${product.date_of_order || "N/A"}</td>
          <td><span class="status ${getStatusClass(product.status)}">${product.status || 'Pending'}</span></td>
          <td><button class="delete-btn">Delete</button></td>
        `;
        table.appendChild(newRow);

        // Attach Delete Functionality
        newRow.querySelector(".delete-btn").addEventListener("click", function() {
          deleteProduct(product.id);
        });
      });
    })
    .catch((error) => {
      console.error("Error fetching products:", error);
    });
}

function getStatusClass(status) {
  switch(status?.toLowerCase()) {
    case 'completed': return 'completed';
    case 'pending': return 'pending';
    case 'cancelled': return 'cancelled';
    default: return 'pending';
  }
}

// Modify your startListening function to add visual feedback
function startListening() {
  recognition.start();
  console.log("Listening...");
  document.getElementById("output").innerText = "Listening...";
  document.querySelector(".voice-input-container").classList.add("listening");
}

// Modify your recognition.onresult to update the UI
recognition.onresult = (event) => {
  capturedText = event.results[0][0].transcript;
  console.log("Captured:", capturedText);
  document.getElementById("output").innerText = capturedText;
  document.querySelector(".voice-input-container").classList.remove("listening");

  const parsedData = parseSpeech(capturedText.toLowerCase());
  if (parsedData) {
    document.getElementById("saveBtn").disabled = false;
    document.getElementById("discardBtn").disabled = false;
  }
};

// Modify your recognition.onerror to handle UI updates
recognition.onerror = (event) => {
  console.error("Speech recognition error:", event.error);
  document.getElementById("output").innerText = "Error: " + event.error;
  document.querySelector(".voice-input-container").classList.remove("listening");
};

// Update your resetUI function
function resetUI() {
  document.getElementById("output").innerText = "Your speech will appear here...";
  document.getElementById("saveBtn").disabled = true;
  document.getElementById("discardBtn").disabled = true;
  document.querySelector(".voice-input-container").classList.remove("listening");
  capturedText = "";
}


// Voice Recognition Logic
let recognition;
let capturedText = "";
let currentOrder = null;

function initVoiceRecognition() {
  if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = function() {
      document.getElementById('output').textContent = "Listening...";
      document.querySelector('.voice-section').classList.add('listening');
    };

    recognition.onresult = function(event) {
      capturedText = event.results[0][0].transcript;
      document.getElementById('output').textContent = capturedText;
      document.querySelector('.voice-section').classList.remove('listening');
      
      currentOrder = parseSpeech(capturedText.toLowerCase());
      if (currentOrder) {
        document.getElementById('saveBtn').disabled = false;
        document.getElementById('discardBtn').disabled = false;
      }
    };

    recognition.onerror = function(event) {
      console.error('Speech recognition error:', event.error);
      document.getElementById('output').textContent = 'Error: ' + event.error;
      resetVoiceUI();
    };
  } else {
    alert('Web Speech API is not supported in this browser');
  }
}

function parseSpeech(text) {
  // Example: "Order 5 Nike t-shirts size large in blue for 2000 rupees"
  const pattern = /order (\d+) (.+?) (?:size|for size) (.+?) (?:in|color) (.+?) (?:for|price) (\d+)/i;
  const match = text.match(pattern);

  if (match) {
    return {
      product_name: match[2].trim(),
      brand_name: "Unknown", // You can modify this to capture brand if needed
      category: "Clothing",
      size: match[3].trim(),
      color: match[4].trim(),
      quantity: parseInt(match[1]),
      price: parseFloat(match[5]),
      date_of_order: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
  }
  
  alert("Couldn't understand the order. Please try format: 'Order [quantity] [product] size [size] in [color] for [price]'");
  return null;
}

function saveVoiceOrder() {
  if (!currentOrder) {
    alert('No valid order to save!');
    return;
  }

  fetch('http://localhost:4000/save-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(currentOrder)
  })
  .then(response => {
    if (!response.ok) throw new Error('Failed to save order');
    return response.json();
  })
  .then(data => {
    alert(`Order saved successfully! ID: ${data.orderId}`);
    resetVoiceUI();
    fetchAndDisplayProducts();
  })
  .catch(error => {
    console.error('Error saving order:', error);
    alert('Failed to save order. Please check console for details.');
  });
}

function resetVoiceUI() {
  document.getElementById('output').textContent = 'Your speech will appear here...';
  document.getElementById('saveBtn').disabled = true;
  document.getElementById('discardBtn').disabled = true;
  capturedText = "";
  currentOrder = null;
  if (recognition) recognition.stop();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize voice recognition
  initVoiceRecognition();
  
  // Set up event listeners
  document.getElementById('voiceOrderBtn').addEventListener('click', function() {
    if (!recognition) initVoiceRecognition();
    recognition.start();
  });
  
  document.getElementById('saveBtn').addEventListener('click', saveVoiceOrder);
  document.getElementById('discardBtn').addEventListener('click', resetVoiceUI);
  
  // Load initial products
  fetchAndDisplayProducts();
});

// Save Table Order (for final submission)
document.getElementById("saveTableBtn").addEventListener("click", () => {
  fetch("http://localhost:4000/finalize-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "Completed" })
  })
  .then(response => response.json())
  .then(data => {
    alert("Order finalized and saved to Orders page!");
    document.getElementById("saveTableBtn").style.display = "none";
    // Redirect to orders page or refresh data
    window.location.href = "orders.html"; // Create this page
  })
  .catch(error => {
    console.error("Error finalizing order:", error);
    alert("Failed to finalize order");
  });
});

// Reset Voice UI
function resetVoiceUI() {
  document.getElementById("output").innerText = "Your speech will appear here...";
  document.getElementById("saveVoiceBtn").disabled = true;
  document.getElementById("discardVoiceBtn").disabled = true;
  currentOrder = null;
}

document.addEventListener("DOMContentLoaded", function () {
  // Initialize voice recognition
  if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    // Set up event listeners
    recognition.onresult = function (event) {
      const transcript = event.results[0][0].transcript;
      document.getElementById("output").textContent = transcript;
      document.getElementById("saveVoiceBtn").disabled = false;
      document.getElementById("discardVoiceBtn").disabled = false;
    };

    recognition.onerror = function (event) {
      console.error("Voice recognition error", event.error);
    };
  }

  // Set up button listeners
  document
    .getElementById("voiceOrderBtn")
    .addEventListener("click", function () {
      recognition.start();
      document.getElementById("output").textContent = "Listening...";
    });

  document
    .getElementById("saveVoiceBtn")
    .addEventListener("click", saveVoiceOrder);
  document
    .getElementById("discardVoiceBtn")
    .addEventListener("click", function () {
      document.getElementById("output").textContent =
        "Your speech will appear here...";
      this.disabled = true;
      document.getElementById("saveVoiceBtn").disabled = true;
    });
});

function saveVoiceOrder() {
  const text = document.getElementById("output").textContent;
  if (text === "Your speech will appear here..." || text === "Listening...") {
    alert("No voice input to save!");
    return;
  }

  // Parse and save the order
  const orderData = parseSpeech(text);
  if (orderData) {
    // Add your save logic here
    console.log("Saving order:", orderData);
    alert("Order saved successfully!");
    document.getElementById("saveVoiceBtn").disabled = true;
    document.getElementById("discardVoiceBtn").disabled = true;
  }
}