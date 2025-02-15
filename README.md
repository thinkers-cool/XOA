# XOA (Thinkers AI OA)

A low-code OA (Office Automation) System built with modern web technologies.

## Overview

XOA is a comprehensive office automation system that provides a flexible and efficient platform for managing tickets, workflows, and resources. It features a modern UI, role-based access control, and customizable templates.

## Features

- 🎯 **Ticket Management**: Create, track, and manage tickets efficiently
- 🔄 **Workflow Automation**: Design and implement custom workflows
- 👥 **User Management**: Role-based access control with granular permissions
- 📝 **Template System**: Customizable templates for various business processes
- 🌐 **Internationalization**: Multi-language support
- 🎨 **Theme Support**: Light and dark mode themes
- 📱 **Responsive Design**: Works seamlessly across different devices

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: .\venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables (create a .env file with necessary settings)

5. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```

The backend API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend application will be available at `http://localhost:5173`

### Docker Deployment

The application can be easily deployed using Docker Compose, which will set up the frontend and backend.

1. Set up environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Configure the following environment variables in `.env`:
     ```bash
     # Required settings
     SECRET_KEY="your-secret-key-here"
     
     # Required if using AI features
     AI_API_BASE_URL="your_ai_api_base_url_here"
     AI_API_KEY="your_ai_api_key_here"
     ```

2. Build and start the containers:
   ```bash
   docker-compose up --build
   ```

   This will:
   - Build and start the backend service (available at `http://localhost:8000`)
   - Build and start the frontend service (available at `http://localhost:5173`)
   - Set up proper volume mappings for development and data persistence

3. To stop the services:
   ```bash
   docker-compose down
   ```

### AI API Configuration

The application requires AI API credentials to function properly. Configure the following environment variables:

1. Create or modify the `.env` file in the backend directory:
   ```bash
   # AI API Configuration
   AI_API_BASE_URL="your_ai_api_base_url_here"
   AI_API_KEY="your_ai_api_key_here"
   ```

2. Replace the placeholder values:
   - `AI_API_BASE_URL`: The base URL of the AI API service
   - `AI_API_KEY`: Your API key for authentication

> Note: Keep your API key secure and never commit it to version control.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
