// Navigation functionality
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

// Voice Order System
let recognition;
let isListening = false;
let timer;
let timeLeft = 10;
let ordersCount = 0;
const MAX_ORDERS = 1000;

// Initialize voice recognition
function initVoiceRecognition() {
  if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Display what's being heard
      const output = document.getElementById("output");
      output.innerHTML = `
        ${
          interimTranscript
            ? `<div class="interim">${interimTranscript}</div>`
            : ""
        }
        ${
          finalTranscript
            ? `<div class="final">${finalTranscript}</div>`
            : "Speak now..."
        }
      `;

      // Process complete sentences
      if (finalTranscript) {
        processVoiceCommand(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
      stopContinuousRecording();
      document.getElementById("output").innerHTML += `
        <div class="error">Error: ${event.error}</div>
      `;
    };

    recognition.onend = () => {
      if (isListening) {
        recognition.start();
      }
    };
  } else {
    alert("Web Speech API not supported in this browser");
  }
}

// Process voice commands
function processVoiceCommand(transcript) {
  console.log("Processing:", transcript);

  // Normalize the input
  const normalized = transcript
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\b(order|add|i want|please)\b/gi, "")
    .trim();

  // Extract components with more flexible matching
  const quantityMatch = normalized.match(
    /(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i
  );
  const sizeMatch = normalized.match(
    /(xs|s|small|m|medium|l|large|xl|xlarge|extra large)/i
  );
  const colorMatch = normalized.match(
    /(red|blue|green|black|white|yellow|pink|purple|orange)/i
  );
  const priceMatch = normalized.match(/(\d+)\s*(rs|₹|dollars|dollar|usd)?$/i);

  // Extract product name by removing known patterns
  let productName = normalized;
  if (quantityMatch) productName = productName.replace(quantityMatch[0], "");
  if (sizeMatch) productName = productName.replace(sizeMatch[0], "");
  if (colorMatch) productName = productName.replace(colorMatch[0], "");
  if (priceMatch) productName = productName.replace(priceMatch[0], "");
  productName = productName.replace(/\s+/g, " ").trim();

  // Convert word numbers to digits
  const wordToNum = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
  };

  const quantity = quantityMatch
    ? wordToNum[quantityMatch[0].toLowerCase()] || parseInt(quantityMatch[0])
    : 1;
  const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
  const size = sizeMatch ? sizeMatch[0].charAt(0).toUpperCase() : "M";
  const color = colorMatch ? colorMatch[0] : "Unknown";

  // Check for minimum required fields
  if (!productName || isNaN(quantity) || isNaN(price) || price <= 0) {
    document.getElementById("output").innerHTML += `
      <div class="error">
        Couldn't understand. Try: "2 Nike t-shirts large blue 1200"<br>
        Heard: Quantity: ${quantity}, Product: ${productName}, Price: ${price}
      </div>
    `;
    return;
  }

  const orderData = {
    product_name: productName,
    brand_name: extractBrand(productName) || "Unknown",
    category: determineCategory(productName),
    size: size,
    color: color,
    quantity: quantity,
    price: price,
    date_of_order: new Date().toISOString().split("T")[0],
    status: "Pending",
  };

  saveOrderAutomatically(orderData);
}

// Helper functions
function extractBrand(productName) {
  const brands = ["nike", "adidas", "puma", "zara", "levis", "h&m"];
  const lowerName = productName.toLowerCase();
  for (const brand of brands) {
    if (lowerName.includes(brand)) {
      return brand.charAt(0).toUpperCase() + brand.slice(1);
    }
  }
  return null;
}

function determineCategory(productName) {
  const lowerName = productName.toLowerCase();
  if (/shirt|t-shirt|top|blouse/i.test(lowerName)) return "Tops";
  if (/pant|jean|trouser/i.test(lowerName)) return "Bottoms";
  if (/dress|gown/i.test(lowerName)) return "Dresses";
  return "Clothing";
}

// Save order to backend
async function saveOrderAutomatically(orderData) {
  const output = document.getElementById("output");
  output.innerHTML += `<div class="processing">Processing order...</div>`;

  try {
    // First check if server is reachable
    const healthCheck = await fetch("http://localhost:4000/health");
    if (!healthCheck.ok) throw new Error("Server not responding");

    // Then send the order
    const response = await fetch("http://localhost:4000/save-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Server error");
    }

    const data = await response.json();
    addOrderToTable(data.order);
    output.innerHTML += `
      <div class="success">
        ✔ Order saved: ${orderData.quantity} ${orderData.product_name} (₹${orderData.price})
      </div>
    `;
  } catch (error) {
    console.error("Save error:", error);
    output.innerHTML += `
      <div class="error">
        ✖ Error: ${error.message}<br>
        ${error.message.includes("fetch") ? "Check if server is running" : ""}
      </div>
    `;

    // Only retry for network errors
    if (error.message.includes("fetch")) {
      setTimeout(() => saveOrderAutomatically(orderData), 3000);
    }
  }
}

// Add order to table
function addOrderToTable(order) {
  const table = document.getElementById("clothingTable");
  const newRow = document.createElement("tr");
  newRow.dataset.productId = order.id;

  newRow.innerHTML = `
    <td>${order.product_name}</td>
    <td>${order.brand_name}</td>
    <td>${order.category}</td>
    <td>${order.size}</td>
    <td>${order.color}</td>
    <td>${order.quantity}</td>
    <td>₹${order.price}</td>
    <td>${order.date_of_order}</td>
    <td><span class="status ${order.status.toLowerCase()}">${
    order.status
  }</span></td>
    <td><button class="delete-btn">Delete</button></td>
  `;

  table.insertBefore(newRow, table.firstChild);
  newRow.querySelector(".delete-btn").addEventListener("click", () => {
    deleteProduct(order.id);
  });
}

// Fetch and display products
async function fetchAndDisplayProducts() {
  try {
    const response = await fetch("http://localhost:4000/get-products");
    if (!response.ok) throw new Error("Failed to fetch products");

    const data = await response.json();
    const table = document.getElementById("clothingTable");
    table.innerHTML = "";

    data.forEach((product) => {
      const newRow = document.createElement("tr");
      newRow.dataset.productId = product.id;
      newRow.innerHTML = `
        <td>${product.product_name}</td>
        <td>${product.brand_name}</td>
        <td>${product.category}</td>
        <td>${product.size}</td>
        <td>${product.color}</td>
        <td>${product.quantity}</td>
        <td>₹${product.price}</td>
        <td>${product.date_of_order}</td>
        <td><span class="status ${getStatusClass(product.status)}">${
        product.status
      }</span></td>
        <td><button class="delete-btn">Delete</button></td>
      `;
      table.appendChild(newRow);
      newRow.querySelector(".delete-btn").addEventListener("click", () => {
        deleteProduct(product.id);
      });
    });
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

// Delete product
async function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    try {
      const response = await fetch(
        `http://localhost:4000/delete-product/${productId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to delete product");

      const data = await response.json();
      alert(data.message);
      fetchAndDisplayProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  }
}

// Helper function for status class
function getStatusClass(status) {
  const statusLower = (status || "").toLowerCase();
  if (statusLower === "completed") return "completed";
  if (statusLower === "cancelled") return "cancelled";
  return "pending";
}

// Start/Stop Recording
function startContinuousRecording() {
  if (!recognition) initVoiceRecognition();
  isListening = true;
  recognition.start();
  document.getElementById("voiceOrderBtn").innerHTML =
    '<i class="uil uil-microphone-slash"></i> Stop Recording';
  document.getElementById("voiceOrderBtn").classList.add("listening");
  document.getElementById("voiceTimer").style.display = "flex";
  document.querySelector(".voice-section").classList.add("listening");
  updateTimerDisplay();
  timer = setInterval(handleTimer, 1000);
}

function stopContinuousRecording() {
  isListening = false;
  if (recognition) recognition.stop();
  document.getElementById("voiceOrderBtn").innerHTML =
    '<i class="uil uil-microphone"></i> Start Recording';
  document.getElementById("voiceOrderBtn").classList.remove("listening");
  document.getElementById("voiceTimer").style.display = "none";
  document.querySelector(".voice-section").classList.remove("listening");
  clearInterval(timer);
}

function handleTimer() {
  timeLeft--;
  updateTimerDisplay();
  if (timeLeft <= 0) {
    timeLeft = 10;
    ordersCount++;
    document.getElementById("ordersCounter").textContent = ordersCount;
    if (ordersCount >= MAX_ORDERS) {
      stopContinuousRecording();
      alert("Maximum order limit reached");
    }
  }
}

function updateTimerDisplay() {
  document.getElementById("timerValue").textContent = timeLeft;
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("voiceOrderBtn").addEventListener("click", () => {
    if (isListening) stopContinuousRecording();
    else startContinuousRecording();
  });
  fetchAndDisplayProducts();
});


// Export to CSV functionality
document.getElementById("exportTableBtn").addEventListener("click", exportToCSV);

function exportToCSV() {
  try {
    // Get table data
    const rows = document.querySelectorAll("#clothingTable tr");
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    const headers = [];
    document.querySelectorAll("#clothingTable th").forEach(th => {
      headers.push(th.textContent.replace(" (Rs)", "")); // Clean up header
    });
    csvContent += headers.join(",") + "\r\n";

    // Add data rows
    rows.forEach(row => {
      const rowData = [];
      row.querySelectorAll("td").forEach((cell, index) => {
        if (index < 9) { // Skip action column
          let text = cell.textContent;
          // Remove ₹ symbol from price
          if (index === 6) text = text.replace("₹", "");
          // Handle commas in text
          if (text.includes(",")) text = `"${text}"`;
          rowData.push(text);
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
    
    // Show success message
    document.getElementById("output").innerHTML += `
      <div class="success">✔ CSV exported successfully</div>
    `;
  } catch (error) {
    console.error("Export error:", error);
    document.getElementById("output").innerHTML += `
      <div class="error">✖ Export failed: ${error.message}</div>
    `;
  }
}


// Table Editing
let isEditMode = false;
let originalData = {};

document.getElementById("editTableBtn").addEventListener("click", toggleEditMode);

function toggleEditMode() {
  isEditMode = !isEditMode;
  const table = document.getElementById("clothingTable");
  const editBtn = document.getElementById("editTableBtn");
  const saveBtn = document.getElementById("saveTableBtn");

  if (isEditMode) {
    // Store original data
    originalData = {};
    document.querySelectorAll("#clothingTable tr").forEach((row, rowIndex) => {
      originalData[rowIndex] = {};
      row.querySelectorAll("td:not(:last-child)").forEach((cell, cellIndex) => {
        originalData[rowIndex][cellIndex] = cell.textContent;
      });
    });

    // Update UI
    table.classList.add("editable");
    editBtn.style.display = "none";
    saveBtn.style.display = "inline-block";

    // Make cells editable
    document.querySelectorAll("#clothingTable td:not(:last-child)").forEach(cell => {
      cell.contentEditable = true;
      cell.style.backgroundColor = "#fffde7";
      cell.style.border = "1px solid #ddd";
    });
  } else {
    // Revert UI
    table.classList.remove("editable");
    editBtn.style.display = "inline-block";
    saveBtn.style.display = "none";

    // Make cells non-editable
    document.querySelectorAll("#clothingTable td:not(:last-child)").forEach(cell => {
      cell.contentEditable = false;
      cell.style.backgroundColor = "";
      cell.style.border = "";
    });
  }
}

// Save edited table
document.getElementById("saveTableBtn").addEventListener("click", saveTableChanges);

async function saveTableChanges() {
  const output = document.getElementById("output");
  output.innerHTML += `<div class="processing">Saving changes...</div>`;
  
  try {
    const rows = document.querySelectorAll("#clothingTable tr");
    const updates = [];

    // Collect changes
    rows.forEach((row, rowIndex) => {
      const rowData = {};
      const cells = row.querySelectorAll("td:not(:last-child)");
      const productId = row.dataset.productId;

      cells.forEach((cell, cellIndex) => {
        const columnName = getColumnName(cellIndex);
        const newValue = cell.textContent.trim();
        
        if (columnName && newValue !== originalData[rowIndex][cellIndex]) {
          rowData[columnName] = newValue;
        }
      });

      if (Object.keys(rowData).length > 0 && productId) {
        updates.push({ id: productId, changes: rowData });
      }
    });

    if (updates.length > 0) {
      const response = await fetch("http://localhost:4000/update-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });

      if (!response.ok) throw new Error("Failed to save changes");
      
      const data = await response.json();
      output.innerHTML += `
        <div class="success">✔ ${data.message}</div>
      `;
    } else {
      output.innerHTML += `
        <div class="warning">No changes detected</div>
      `;
    }
  } catch (error) {
    console.error("Save changes error:", error);
    output.innerHTML += `
      <div class="error">✖ Error saving changes: ${error.message}</div>
    `;
  } finally {
    toggleEditMode(); // Exit edit mode
    fetchAndDisplayProducts(); // Refresh table
  }
}

function getColumnName(index) {
  const columns = [
    'product_name', 'brand_name', 'category', 'size', 
    'color', 'quantity', 'price', 'date_of_order', 'status'
  ];
  return columns[index];
}