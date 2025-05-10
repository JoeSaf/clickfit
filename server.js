const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2');
const app = express();
const PORT = process.env.PORT || 3000;

// Create upload directory if it doesn't exist
const uploadDir = path.join(__dirname, 'upload_images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure static file serving
app.use(express.static(path.join(__dirname, 'public')));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        // Create unique filename with original extension
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to only accept images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

// MySQL Connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'kilimanjaro02',  // Updated password
    database: process.env.DB_NAME || 'clickfit_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create connection pool with error handling
const pool = mysql.createPool(dbConfig);
const promisePool = pool.promise();

// Test database connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Successfully connected to database');
    connection.release();
});

// API Endpoints
// Handle image uploads
app.post('/upload', upload.array('images', 10), (req, res) => {
    try {
        const uploadedFiles = req.files;
        if (!uploadedFiles || uploadedFiles.length === 0) {
            return res.status(400).json({ success: false, message: 'No files uploaded' });
        }
        
        // Return success response with file details
        res.status(200).json({
            success: true,
            message: `${uploadedFiles.length} files uploaded successfully`,
            files: uploadedFiles.map(file => ({
                filename: file.filename,
                path: file.path,
                size: file.size
            }))
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading files',
            error: error.message
        });
    }
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: err.message
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Image upload directory: ${uploadDir}`);
});

// Initialize MySQL Database
async function initializeDatabase() {
    try {
        // Create the users table
        const createTableSQL = `
        CREATE TABLE IF NOT EXISTS users (
            \`ID\` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            \`email\` VARCHAR(255) CHARACTER SET 'utf8mb4' NOT NULL,
            \`password\` VARCHAR(255) CHARACTER SET 'utf8mb4' NOT NULL,
            \`type\` VARCHAR(255) CHARACTER SET 'utf8mb4' NOT NULL,
            \`active\` TINYINT DEFAULT 1
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `;
        
        // Create stored procedure for adding users
        const createProcedureSQL = `
        CREATE PROCEDURE IF NOT EXISTS \`addUser\`(
            IN p_email VARCHAR(255),
            IN p_password VARCHAR(255),
            IN p_type VARCHAR(255)
        )
        BEGIN
            INSERT INTO users (email, password, type, active)
            VALUES (p_email, p_password, p_type, 1);
        END;
        `;
        
        // Execute the SQL to create table
        await promisePool.query(createTableSQL);
        console.log('Users table created or already exists');
        
        // Execute the SQL to create stored procedure
        await promisePool.query(createProcedureSQL);
        console.log('addUser stored procedure created or already exists');
        
        // Example call to stored procedure
        const insertUserSQL = `CALL addUser('admin@clickfit.com', 'securePassword123', 'admin');`;
        await promisePool.query(insertUserSQL);
        console.log('Example user added using stored procedure');
        
    } catch (error) {
        console.error('Database initialization error:', error);
    }
}

// Call the initialization function when starting the server
initializeDatabase().catch(console.error);

// MySQL Database Scripts (separate file: db_scripts.sql)
/*
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    `ID` INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `email` VARCHAR(255) CHARACTER SET 'utf8mb4' NOT NULL,
    `password` VARCHAR(255) CHARACTER SET 'utf8mb4' NOT NULL,
    `type` VARCHAR(255) CHARACTER SET 'utf8mb4' NOT NULL,
    `active` TINYINT DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create stored procedure for adding users
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS `addUser`(
    IN p_email VARCHAR(255),
    IN p_password VARCHAR(255),
    IN p_type VARCHAR(255)
)
BEGIN
    INSERT INTO users (email, password, type, active)
    VALUES (p_email, p_password, p_type, 1);
END //
DELIMITER ;

-- Example call to stored procedure
CALL addUser('admin@clickfit.com', 'securePassword123', 'admin');
*/

// package.json
/*
{
  "name": "click-fit",
  "version": "1.0.0",
  "description": "A fitness website for On Wave Group technical assessment",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "multer": "^1.4.5-lts.1",
    "mysql2": "^3.6.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
*/ 