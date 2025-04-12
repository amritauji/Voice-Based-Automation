const mysql = require("mysql2"); // Use mysql2 instead of mysql
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost", // Use 'localhost' for local MySQL
  user: "root", // Replace with your MySQL username
  password: "admin", // Replace with your MySQL password
  database: "clothing_store", // Replace with your database name
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL");
});

// API Route to Save Data
app.post("/save-text", (req, res) => {
  const { product_name, brand_name, category, size, color, quantity, price } =
    req.body;

  console.log("Received data:", req.body); // Log the received data

  // Validate required fields
  if (
    !product_name ||
    !brand_name ||
    !category ||
    !size ||
    !color ||
    !quantity ||
    !price
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const insertQuery = `
    INSERT INTO products (product_name, brand_name, category, size, color, quantity, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    insertQuery,
    [product_name, brand_name, category, size, color, quantity, price],
    (err, results) => {
      if (err) {
        console.error("Error inserting into database:", err);
        return res.status(500).json({ message: "Error saving to database" });
      }
      res.json({ message: "Product saved successfully" });
    }
  );
});

app.listen(4000, () => console.log("Server running on port 4000"));


// API Route to Fetch Data
app.get("/get-products", (req, res) => {
  const selectQuery = "SELECT * FROM products";

  db.query(selectQuery, (err, results) => {
    if (err) {
      console.error("Error fetching data from database:", err);
      return res.status(500).json({ message: "Error fetching data" });
    }
    res.json(results);
  });
});

// API Route to Delete Data
app.delete("/delete-product/:id", (req, res) => {
  const productId = req.params.id;
  const deleteQuery = "DELETE FROM products WHERE id = ?";

  db.query(deleteQuery, [productId], (err, results) => {
    if (err) {
      console.error("Error deleting product:", err);
      return res.status(500).json({ message: "Error deleting product" });
    }
    res.json({ message: "Product deleted successfully" });
  });
});


// API Route for Bulk Updates
app.post('/update-products', (req, res) => {
  const { updates } = req.body;
  
  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({ message: "Invalid update data" });
  }

  let completedUpdates = 0;
  const errors = [];

  updates.forEach(update => {
    const { id, changes } = update;
    const updateQuery = `UPDATE products SET ? WHERE id = ?`;
    
    db.query(updateQuery, [changes, id], (err, results) => {
      if (err) {
        console.error(`Error updating product ${id}:`, err);
        errors.push(id);
      } else {
        completedUpdates++;
      }
      
      // When all updates are processed
      if (completedUpdates + errors.length === updates.length) {
        if (errors.length > 0) {
          res.status(207).json({ 
            message: `Updated ${completedUpdates} products, failed on ${errors.length}`,
            failedUpdates: errors
          });
        } else {
          res.json({ message: `Successfully updated ${completedUpdates} products` });
        }
      }
    });
  });
});

// Save Initial Order
app.post('/save-order', (req, res) => {
  const orderData = req.body;
  orderData.status = "Pending"; // Default status
  
  const query = `
    INSERT INTO orders 
    (product_name, brand_name, category, size, color, quantity, price, date_of_order, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [
    orderData.product_name,
    orderData.brand_name,
    orderData.category,
    orderData.size,
    orderData.color,
    orderData.quantity,
    orderData.price,
    orderData.date_of_order,
    orderData.status
  ], (err, results) => {
    if (err) {
      console.error("Error saving order:", err);
      return res.status(500).json({ message: "Error saving order" });
    }
    res.json({ 
      message: "Order saved successfully",
      orderId: results.insertId
    });
  });
});

// Finalize Order
app.post('/finalize-order', (req, res) => {
  const { orderId } = req.body;
  
  const query = `
    UPDATE orders 
    SET status = 'Completed'
    WHERE id = ?
  `;
  
  db.query(query, [orderId], (err, results) => {
    if (err) {
      console.error("Error finalizing order:", err);
      return res.status(500).json({ message: "Error finalizing order" });
    }
    res.json({ message: "Order finalized successfully" });
  });
});

// Get Orders for Orders Page
app.get('/get-orders', (req, res) => {
  const query = "SELECT * FROM orders ORDER BY date_of_order DESC";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ message: "Error fetching orders" });
    }
    res.json(results);
  });
});