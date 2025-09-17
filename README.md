# FluxAPI

A modern, minimalist API client built with Electron, React, and TypeScript. Designed for developers who need a powerful yet simple tool for testing and debugging APIs.

![FluxAPI](https://img.shields.io/badge/version-1.0.0--beta.1-blue)
![Electron](https://img.shields.io/badge/Electron-37.2.3-blue)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue)

## ✨ Features

### 🚀 Core Functionality

- **HTTP Methods Support**: GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS
- **Request Builder**: Intuitive interface for constructing API requests
- **Response Viewer**: Beautiful, syntax-highlighted response display
- **Request History**: Automatic saving and organization of requests
- **Collections**: Organize your API requests into collections

### 🎨 User Interface

- **Modern Design**: Clean, dark-themed interface with smooth animations
- **Tabbed Interface**: Work with multiple requests simultaneously
- **Collapsible Sections**: Organized request/response details
- **Syntax Highlighting**: JSON, XML, YAML, and JavaScript support
- **Responsive Layout**: Optimized for different screen sizes

### 🔧 Advanced Features

- **CodeMirror Editor**: Advanced code editing with syntax highlighting
- **Parameter Management**: Query parameters, headers, and authentication
- **Body Types**: Support for Text, JSON, XML, Form Data, and File uploads
- **Authentication**: Basic Auth, Bearer Token, and API Key support
- **Environment Variables**: Manage different environments and variables
- **Auto-save**: Automatic saving of all changes

### 💾 Data Management

- **SQLite Database**: Local storage for requests and collections
- **Import/Export**: Backup and share your API collections
- **Search & Filter**: Quickly find requests in your collections

## 🛠️ Tech Stack

### Frontend

- **React 19** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component library
- **CodeMirror 6** - Advanced code editor
- **Zustand** - Lightweight state management
- **React Query** - Data fetching and caching

### Backend

- **Electron** - Cross-platform desktop application framework
- **Node.js** - JavaScript runtime
- **SQLite** - Local database for data persistence
- **Axios** - HTTP client for API requests

### Development Tools

- **Vite** - Fast build tool and development server
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Electron Builder** - Application packaging

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm or pnpm
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/M-Skilla/fluxapi.git
   cd fluxapi
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Start development mode**

   ```bash
   pnpm dev
   ```

4. **Build for production**

   ```bash
   # Windows
   pnpm build:win

   # macOS
   pnpm build:mac

   # Linux
   pnpm build:linux
   ```

## 📁 Project Structure

```tree
fluxapi/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── index.ts         # Main application entry
│   │   └── db.ts            # Database operations
│   ├── preload/             # Electron preload scripts
│   └── renderer/            # React frontend
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── lib/         # Utilities and stores
│       │   ├── pages/       # Application pages
│       │   └── stores/      # Zustand stores
│       └── index.html       # Main HTML template
├── build/                   # Build resources
├── resources/              # Application icons
└── package.json            # Project configuration
```

## 🎯 Usage

### Creating Your First Request

1. **Launch FluxAPI**
2. **Create a new request** by clicking the "+" button
3. **Enter your API endpoint** in the URL field
4. **Select HTTP method** from the dropdown
5. **Add headers, parameters, or body** as needed
6. **Click "Send"** to execute the request
7. **View the response** in the response panel

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm start            # Preview production build

# Building
pnpm build            # Type check and build
pnpm build:win        # Build for Windows
pnpm build:mac        # Build for macOS
pnpm build:linux      # Build for Linux

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier
pnpm typecheck        # Run TypeScript type checking
```

### Development Setup

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Start development**

   ```bash
   pnpm dev
   ```

3. **Open in your editor** and start coding!

### Project Architecture

- **Main Process**: Handles Electron window management and IPC
- **Renderer Process**: React application with UI components
- **Database Layer**: SQLite with DAO pattern
- **State Management**: Zustand for client state, React Query for server state

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**
4. **Run tests and linting**

   ```bash
   pnpm lint
   pnpm typecheck
   ```

5. **Commit your changes**

   ```bash
   git commit -m 'Add amazing feature'
   ```

6. **Push to the branch**

   ```bash
   git push origin feature/amazing-feature
   ```

7. **Open a Pull Request**

## Future Release

### Working with Collections

1. **Create a collection** from the sidebar
2. **Add requests** to your collection
3. **Organize related APIs** together
4. **Export/import** collections for sharing

### Advanced Features

- **Authentication**: Set up auth in the Auth tab
- **Environment Variables**: Manage different environments
- **Request History**: Access previous requests
- **Code Generation**: Copy requests as cURL commands

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Electron Team** for the amazing desktop framework
- **React Team** for the powerful UI library
- **CodeMirror** for the excellent code editor
- **ShadCN UI** for the accessible component library
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/M-Skilla/fluxapi/issues)
- **Discussions**: [GitHub Discussions](https://github.com/M-Skilla/fluxapi/discussions)
- **Email**: For business inquiries

## 🔄 Version History

### v1.0.0-beta.1

- Initial beta release
- Core API client functionality
- Request/response handling
- Collections and organization
- Modern UI with dark theme
- SQLite database integration

---

**Made with ❤️ by [Skilla](https://github.com/M-Skilla)**
