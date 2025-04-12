const mysql = require("mysql2/promise");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "admin",
  database: "clothing_store",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initialize database
async function initializeDatabase() {
  try {
    // Drop existing table if it has wrong schema
    await pool.query("DROP TABLE IF EXISTS products");

    // Create new table with correct schema
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        brand_name VARCHAR(255) DEFAULT 'Unknown',
        category VARCHAR(255) DEFAULT 'Clothing',
        size VARCHAR(50) DEFAULT 'M',
        color VARCHAR(50) DEFAULT 'Unknown',
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        date_of_order DATE DEFAULT (CURRENT_DATE()),
        status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Database initialized successfully");
  } catch (err) {
    console.error("Database initialization failed:", err);
  }
}

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "healthy", database: "connected" });
  } catch (err) {
    res.status(500).json({ status: "unhealthy", database: "disconnected" });
  }
});

// Save order endpoint
app.post("/save-order", async (req, res) => {
  try {
    const { product_name, quantity, price } = req.body;
    if (!product_name || !quantity || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [result] = await pool.query(
      `
      INSERT INTO products SET ?
    `,
      [
        {
          product_name: product_name.trim(),
          brand_name: req.body.brand_name || "Unknown",
          category: req.body.category || "Clothing",
          size: req.body.size || "M",
          color: req.body.color || "Unknown",
          quantity: parseInt(quantity),
          price: parseFloat(price),
          status: req.body.status || "Pending",
        },
      ]
    );

    res.json({
      success: true,
      order: {
        id: result.insertId,
        ...req.body,
      },
    });
  } catch (err) {
    console.error("Save error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Get products endpoint
app.get("/get-products", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Delete product endpoint
app.delete("/delete-product/:id", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json({
      success: true,
      message: `Product ${req.params.id} deleted successfully`,
    });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Database error", details: err.message });
  }
});

// Initialize and start server
async function startServer() {
  await initializeDatabase();
  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup failed:", err);
  process.exit(1);
});



// Update products endpoint
app.post("/update-products", async (req, res) => {
  try {
    const updates = req.body.updates;
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ error: "Invalid updates format" });
    }

    let updatedCount = 0;
    
    // Process each update
    for (const update of updates) {
      const { id, changes } = update;
      if (!id || !changes || typeof changes !== 'object') continue;
      
      const setClause = Object.keys(changes).map(key => `${key} = ?`).join(', ');
      const values = Object.values(changes);
      values.push(id);

      await pool.query(
        `UPDATE products SET ${setClause} WHERE id = ?`,
        values
      );
      updatedCount++;
    }

    res.json({
      success: true,
      message: `Updated ${updatedCount} product(s)`,
      updated: updatedCount
    });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ 
      error: "Database error", 
      details: err.message 
    });
  }
});