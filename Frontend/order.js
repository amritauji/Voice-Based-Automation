document.addEventListener("DOMContentLoaded", function () {
  fetchOrders();

  // Add event listeners for filters
  document
    .getElementById("statusFilter")
    .addEventListener("change", fetchOrders);
  document.getElementById("dateFilter").addEventListener("change", fetchOrders);
});

function fetchOrders() {
  const status = document.getElementById("statusFilter").value;
  const date = document.getElementById("dateFilter").value;

  let url = "http://localhost:4000/get-orders";
  const params = [];

  if (status !== "all") params.push(`status=${status}`);
  if (date) params.push(`date=${date}`);

  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      displayOrders(data);
      updateStats(data);
    })
    .catch((error) => {
      console.error("Error fetching orders:", error);
      document.getElementById("ordersList").innerHTML = `
        <div class="no-orders">
          <i class="uil uil-exclamation-triangle"></i>
          <p>Error loading orders. Please try again.</p>
        </div>
      `;
    });
}

function displayOrders(orders) {
  const ordersList = document.getElementById("ordersList");

  if (orders.length === 0) {
    ordersList.innerHTML = `
      <div class="no-orders">
        <i class="uil uil-clipboard-blank"></i>
        <p>No orders found</p>
      </div>
    `;
    return;
  }

  ordersList.innerHTML = orders
    .map(
      (order) => `
    <div class="order-card">
      <div class="order-header">
        <span class="order-id">#ORD-${order.id
          .toString()
          .padStart(4, "0")}</span>
        <span class="order-date">${formatDate(order.date_of_order)}</span>
        <span class="order-status ${order.status.toLowerCase()}">${
        order.status
      }</span>
      </div>
      <div class="order-details">
        <div class="order-row">
          <div class="order-product">
            <img src="https://via.placeholder.com/60?text=${encodeURIComponent(
              order.product_name.substring(0, 2)
            )}" 
                 alt="${order.product_name}">
            <div class="order-product-info">
              <h4>${order.product_name}</h4>
              <p>${order.brand_name} • ${order.category} • ${order.size} • ${
        order.color
      }</p>
            </div>
          </div>
          <div class="order-price">
            <div class="amount">₹${order.price}</div>
            <div class="qty">Qty: ${order.quantity}</div>
          </div>
        </div>
        <div class="order-total">
          <span>Total</span>
          <span>₹${(order.price * order.quantity).toFixed(2)}</span>
        </div>
      </div>
    </div>
  `
    )
    .join("");
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

function updateStats(orders) {
  document.getElementById("totalOrders").textContent = orders.length;

  const completed = orders.filter((o) => o.status === "Completed").length;
  document.getElementById("completedOrders").textContent = completed;

  const pending = orders.filter((o) => o.status === "Pending").length;
  document.getElementById("pendingOrders").textContent = pending;

  const totalValue = orders.reduce((sum, order) => {
    return sum + order.price * order.quantity;
  }, 0);
  document.getElementById("totalValue").textContent = `₹${totalValue.toFixed(
    2
  )}`;
}
