Voice-Based Automation
A web application that allows users to create purchase orders using voice commands. The application integrates voice recognition, a MySQL database, and a Node.js backend to automate the process of creating and managing orders.

Features
Voice Recognition: Create purchase orders using voice commands.

Database Integration: Store and retrieve orders from a MySQL database.

Dynamic Table: Display orders in a table that updates in real-time.

Delete Functionality: Remove orders from the database.

Technologies Used
Frontend:

HTML, CSS, JavaScript

Unicons for icons

Web Speech API for voice recognition

Backend:

Node.js

Express.js

MySQL (via mysql2 library)

Database:

MySQL

Prerequisites
Before you begin, ensure you have the following installed:

Node.js: Download and install from nodejs.org.

MySQL: Install MySQL from mysql.com.

Git: Install Git from git-scm.com.

Setup Instructions
1. Clone the Repository
bash
Copy
git clone https://github.com/your-username/voice-based-automation.git
cd voice-based-automation
2. Set Up the Backend
Navigate to the backend folder:

bash
Copy
cd backend
Install dependencies:

bash
Copy
npm install
Set up the MySQL database:

Open MySQL Workbench or the MySQL command-line client.

Create a database named clothing_store:

sql
Copy
CREATE DATABASE clothing_store;
Create the products table:

sql
Copy
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
Update the database configuration in server.js:

javascript
Copy
const db = mysql.createConnection({
  host: "localhost",
  user: "root", // Replace with your MySQL username
  password: "admin", // Replace with your MySQL password
  database: "clothing_store",
});
Start the backend server:

bash
Copy
node server.js
The server will run on http://localhost:4000.

3. Set Up the Frontend
Navigate to the frontend folder:

bash
Copy
cd ../frontend
Open index.html in your browser:

You can use a live server extension in VS Code or simply open the file directly in your browser.

Project Structure
Copy
voice-based-automation/
├── frontend/
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styles
│   ├── script.js           # Frontend JavaScript logic
├── backend/
│   ├── server.js           # Backend entry point
│   ├── package.json        # Backend dependencies
│   ├── package-lock.json   # Lock file for dependencies
│   ├── node_modules/       # Installed dependencies
API Endpoints
The backend exposes the following API endpoints:

Save Product:

Method: POST

URL: http://localhost:4000/save-text

Body:

json
Copy
{
  "product_name": "T-Shirt",
  "brand_name": "Nike",
  "category": "Men's",
  "size": "M",
  "color": "Black",
  "quantity": 10,
  "price": 799
}
Get Products:

Method: GET

URL: http://localhost:4000/get-products

Delete Product:

Method: DELETE

URL: http://localhost:4000/delete-product/:id

Contributing
We welcome contributions! Here’s how you can contribute:

Fork the Repository:

Click the "Fork" button on the top right of the repository page.

Clone Your Fork:

bash
Copy
git clone https://github.com/your-username/voice-based-automation.git
cd voice-based-automation
Create a New Branch:

bash
Copy
git checkout -b feature/your-feature-name
Make Changes:

Add new features, fix bugs, or improve documentation.

Commit Your Changes:

bash
Copy
git add .
git commit -m "Add your commit message here"
Push to Your Fork:

bash
Copy
git push origin feature/your-feature-name
Create a Pull Request:

Go to the original repository and click "New Pull Request".

Describe your changes and submit the PR.

License
This project is licensed under the MIT License. See the LICENSE file for details.

Acknowledgments
Thanks to Unicons for providing the icons.

Thanks to the Web Speech API for enabling voice recognition.

Contact
If you have any questions or suggestions, feel free to reach out:

Your Name: Your Email

GitHub: Your GitHub Profile

Enjoy using and contributing to the Voice-Based Automation project! 🚀

