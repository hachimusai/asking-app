# AskingWho

AskingWho is a full-stack Q&A social platform where users can register, ask and answer questions, and interact with each other. The project is built with a React (Vite) frontend and a Node.js (Express) backend.

## Features
- User registration and login
- Profile management
- Ask and answer questions
- Like, comment, and follow features
- Responsive and modern UI (Tailwind CSS)
- JWT-based authentication

## Project Structure
```
askingwho/
├── backend/      # Node.js + Express backend API
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── frontend/     # React (Vite) frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
└── README.md     # Project documentation
```

## Getting Started

### Prerequisites
- Node.js
- npm (comes with Node.js)
- MongoDB

### Installation
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd askingwho
   ```

2. **Install dependencies for both frontend and backend:**
   ```bash
   cd frontend
   npm install
   cd backend
   npm install
   ```

### Running the Project

#### Backend
1. Configure your environment variables (e.g., database URI, JWT secret) as needed.
2. Start the backend server:
   ```bash
   node server.js
   ```
   The backend will run on [http://localhost:5000](http://localhost:5000) by default.

#### Frontend
1. In a new terminal, go to the frontend folder:
   ```bash
   cd frontend
   npm run dev
   ```
   The frontend will run on [http://localhost:5173](http://localhost:5173) by default.

## Folder Details
- **frontend/**: Contains all React source code, components, pages, and static assets.
- **backend/**: Contains Express server, API routes, models, controllers, and middleware.

## Contributing
1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request



## Note
Some sections may include Turkish content. I'll update them to English soon.
## License
This project is licensed under the MIT License.

---

For any questions or issues, please open an issue or contact the maintainer. 