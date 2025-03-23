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