# ClickFit - Fitness Journey Platform

ClickFit is a modern web application designed to help users track their fitness journey, share progress, and connect with a community of fitness enthusiasts.

## Features

- Modern, responsive design
- Image upload functionality
- User authentication system
- Daily fitness facts
- Testimonials section
- Community features (coming soon)
- Nutrition tracking (coming soon)

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/JoeSaf/clickfit.git
cd clickfit
```

2. Install dependencies:
```bash
npm install
```

3. Set up the MySQL database:
```bash
# Login to MySQL as root
sudo mysql -u root -p

# Enter your MySQL root password when prompted
# Default password is: kilimanjaro02
```

4. Initialize the database:
```bash
sudo mysql -u root -p < init_db.sql
```

5. Create a `.env` file in the root directory with the following content:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=kilimanjaro02
DB_NAME=clickfit_db
PORT=3000
```

## Running the Application

1. Start the server:
```bash
npm start
```

2. For development with auto-reload:
```bash
npm run dev
```

3. Access the application:
- Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
clickfit/
├── public/                 # Static files
│   ├── css/               # Stylesheets
│   ├── js/                # Client-side JavaScript
│   └── index.html         # Main HTML file
├── upload_images/         # Directory for uploaded images
├── server.js             # Main server file
├── init_db.sql           # Database initialization script
└── package.json          # Project dependencies
```

## Database Schema

The application uses a MySQL database with the following structure:

### Users Table
```sql
CREATE TABLE users (
    ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    active TINYINT DEFAULT 1
);
```

## API Endpoints

- `POST /upload` - Upload images (max 10 files, 5MB each)
- `GET /` - Serve main application
- All other routes redirect to 404 page

## Contact Information

- Email: info@clickfit.com
- Phone: (0743) 773-656
- Address: Arusha, Arusha Region

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For support, email info@clickfit.com or create an issue in the repository. 