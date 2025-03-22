# Voice-Based Automation

A web application that allows users to create purchase orders using voice commands. The application integrates voice recognition, a MySQL database, and a Node.js backend to automate the process of creating and managing orders.

## Features
- **Voice Recognition**: Create purchase orders using voice commands.
- **Database Integration**: Store and retrieve orders from a MySQL database.
- **Dynamic Table**: Display orders in a table that updates in real-time.
- **Delete Functionality**: Remove orders from the database.

## Technologies Used
### Frontend:
- HTML, CSS, JavaScript
- Unicons for icons
- Web Speech API for voice recognition

### Backend:
- Node.js
- Express.js
- MySQL (via mysql2 library)

### Database:
- MySQL

## Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js**: Download and install from [nodejs.org](https://nodejs.org/).
- **MySQL**: Install MySQL from [mysql.com](https://www.mysql.com/).
- **Git**: Install Git from [git-scm.com](https://git-scm.com/).

## Setup Instructions
### 1. Clone the Repository
```bash
git clone https://github.com/amritauji/Voice-Based-Automation.git
cd voice-based-automation
```

### 2. Set Up the Backend
Navigate to the backend folder:
```bash
cd backend
```
Install dependencies:
```bash
npm install
```

### 3. Set Up the MySQL Database
Open MySQL Workbench or the MySQL command-line client and execute the following commands:
```sql
CREATE DATABASE clothing_store;

USE clothing_store;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_name VARCHAR(255),
  brand_name VARCHAR(255),
  category ENUM('Men\'s', 'Unisex', 'Women\'s'),
  size ENUM('S', 'M', 'L', 'XL'),
  color VARCHAR(50),
  quantity INT,
  price DECIMAL(10,2)
);
```

### 4. Update Database Configuration
Modify the database configuration in `server.js`:
```javascript
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "admin", // Replace with your MySQL password
  database: "clothing_store",
});
```

### 5. Start the Backend Server
```bash
node server.js
```
The server will run on [http://localhost:4000](http://localhost:4000).

---
**Happy Coding! 🚀**
