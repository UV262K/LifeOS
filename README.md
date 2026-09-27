# 🧠 LifeOS

A local-first personal productivity and finance dashboard designed to bring planning, routines, goals, activity tracking, and budgeting into one lightweight application.

## ✨ Features

- 📅 Weekly planning and daily logs
- 🎯 Goals and quick activity tracking
- 🧩 Modular routines for areas such as OTA, Career, College, Track, Food, and Life Reset
- 📊 Progress and weekly completion tracking
- 💰 Monthly finance categories and budgets
- 🧾 Expense and income tracking
- 📈 Budget utilization percentages
- 🌍 Configurable currency settings
- 💾 Local SQLite persistence
- 📱 Responsive single-page frontend
- ⚡ No external npm runtime dependencies

## 🏗️ Architecture

```text
┌─────────────────────────────┐
│        Browser UI           │
│      HTML / CSS / JS        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Node.js Server        │
│       REST-style API        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       SQLite Database       │
│       Local persistence     │
└─────────────────────────────┘
```

User data is stored locally rather than in a remote database.

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js
- **Database:** SQLite via Node's built-in `node:sqlite`
- **API:** HTTP/JSON REST-style endpoints
- **Runtime:** Node.js 22.13+
- **Dependencies:** No npm packages required

## 📁 Project Structure

```text
LifeOS/
├── backend/
│   └── server.js
├── frontend/
│   └── index.html
├── package.json
├── .gitignore
├── start-lifeos-windows.bat
├── start-lifeos-mac-linux.sh
└── README.md
```

## 🚀 Run Locally

### Requirements

- Node.js **22.13 or newer**

### Windows

```text
start-lifeos-windows.bat
```

### macOS / Linux

```bash
chmod +x start-lifeos-mac-linux.sh
./start-lifeos-mac-linux.sh
```

Or:

```bash
npm start
```

The application runs locally and opens in the browser.

## 🔐 Data & Privacy

LifeOS creates a local database:

```text
data/lifeos.db
```

The `data/` directory and database files are excluded from Git so personal application data is not committed to the repository.

## 💰 Finance Module

The finance module includes:

- Custom spending categories
- Monthly category budgets
- Expense entries
- Monthly spending totals
- Budget utilization
- Income tracking
- Currency configuration

## 🔌 API

The backend exposes functionality for:

- Application health
- Planner state
- Activity logs
- Data reset
- Finance categories
- Finance entries
- Finance settings

## 🗺️ Roadmap

- Cloud synchronization
- Authentication
- Mobile deployment
- External financial integrations
- Expanded analytics
- More visualization and reporting

## 👨‍💻 Author

**Yuvraj Singh Pathania**

B.Sc. Computer Science (Hons.) — Cloud Computing  
MIT World Peace University, Pune

GitHub: [@UV262K](https://github.com/UV262K)

