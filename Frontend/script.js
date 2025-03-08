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

document.getElementById("newOrderBtn").addEventListener("click", function () {
  const table = document.getElementById("clothingTable");

  // Randomized data for new rows
  const products = ["T-Shirt", "Jeans", "Hoodie", "Sweater", "Jacket"];
  const brands = ["Nike", "Adidas", "Levi's", "Puma", "Reebok"];
  const categories = ["Men's", "Women's", "Unisex"];
  const sizes = ["S", "M", "L", "XL", "XXL"];
  const colors = ["Black", "Blue", "Red", "White", "Green"];
  const statusOptions = ["Completed", "Pending", "Cancelled"];

  const product = products[Math.floor(Math.random() * products.length)];
  const brand = brands[Math.floor(Math.random() * brands.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const size = sizes[Math.floor(Math.random() * sizes.length)];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const quantity = Math.floor(Math.random() * 50) + 1;
  const price = Math.floor(Math.random() * 3000) + 500;
  const orderDate = new Date().toISOString().split("T")[0];
  const status =
    statusOptions[Math.floor(Math.random() * statusOptions.length)];

  // Create Row
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
                <td>${product}</td>
                <td>${brand}</td>
                <td>${category}</td>
                <td>${size}</td>
                <td>${color}</td>
                <td>${quantity}</td>
                <td>${price}</td>
                <td>${orderDate}</td>
                <td><span class="status ${status.toLowerCase()}">${status}</span></td>
                <td><button class="delete-btn">Delete</button></td>
            `;

  // Append Row to Table
  table.appendChild(newRow);

  // Attach Delete Functionality to New Button
  newRow.querySelector(".delete-btn").addEventListener("click", function () {
    this.parentElement.parentElement.remove();
  });
});

// Enable delete for existing rows
document.querySelectorAll(".delete-btn").forEach((button) => {
  button.addEventListener("click", function () {
    this.parentElement.parentElement.remove();
  });
});
