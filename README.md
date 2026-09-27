# LifeOS

A local-first personal productivity and finance dashboard built with Node.js, SQLite, HTML, CSS, and JavaScript.

LifeOS combines weekly planning, modular routines, goals, activity logging, progress tracking, and personal budgeting in one lightweight application.

## Features

- Modular planning for areas such as OTA, Career, College, Track, Food, and Life Reset
- Weekly routine and day-by-day planning
- Goals and quick activity logging
- Calendar-based daily logs
- Progress tracking with weekly completion scores
- Finance categories with monthly budgets
- Expense tracking and budget utilization
- Income and currency settings
- Local SQLite persistence
- Responsive single-page frontend
- Zero external npm runtime dependencies

## Architecture

```
Browser
   ↓
HTML / CSS / JavaScript frontend
   ↓
Node.js HTTP server
   ↓
REST-style /api endpoints
   ↓
SQLite database (data/lifeos.db)
```

The backend serves the frontend and exposes the application API. User data is stored locally on the machine rather than in a remote database.

## Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js
- **Database:** SQLite via Node's built-in `node:sqlite`
- **APIs:** HTTP/JSON REST-style endpoints
- **Runtime:** Node.js 22.13+
- **Dependencies:** No npm packages required

## Project Structure

```
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

## Run Locally

### Requirements

Node.js **22.13 or newer**.

### Windows

Double-click:

```
start-lifeos-windows.bat
```

### macOS / Linux

```bash
chmod +x start-lifeos-mac-linux.sh
./start-lifeos-mac-linux.sh
```

Or run directly:

```bash
npm start
```

LifeOS runs locally and opens in the browser.

## Data & Privacy

The application creates:

```
data/lifeos.db
```

The `data/` directory and database files are excluded from Git through `.gitignore`, so personal LifeOS data is not committed to the repository.

## Finance Module

The finance module supports:

- Custom spending categories
- Monthly category budgets
- Expense entries
- Monthly spending totals
- Budget utilization percentages
- Income tracking
- Currency symbol configuration

## API

The backend includes endpoints for:

- Application health
- Planner state
- Activity logs
- Data reset
- Finance categories
- Finance entries
- Finance settings

## Roadmap

Potential future improvements include cloud synchronization, authentication, mobile deployment, external financial integrations, and richer analytics.

## Author

**Yuvraj Singh Pathania**  
B.Sc. Computer Science (Hons.) — Cloud Computing  
MIT World Peace University, Pune

