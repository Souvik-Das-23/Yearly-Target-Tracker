# Aegis | Yearly Target & Goal Tracker 🎯

A private, offline-first web application designed to help you plan, track, and conquer your yearly targets.

**100% Client-Side:** No server, no accounts, and zero cloud tracking. All your goals, milestones, notes, and progress are stored securely in your web browser's local cache (`localStorage`).

---

## ✨ Features

- 🔒 **Zero Server / 100% Private**: Your data never leaves your computer.
- 🗓️ **Multi-Year Support**: Effortlessly switch between years (past archives, current year, or future planning).
- ⏱️ **Annual Pacing & Pace Indicator**:
  - Compares calendar time elapsed with target completion percentage.
  - Gives live feedback: *Ahead of Schedule 🚀*, *On Track 🎯*, *Needs Focus ⚠️*, or *Falling Behind ⏳*.
- 🎯 **3 Flexible Tracking Metrics**:
  1. **Numeric Counter**: Track targets with incremental units (e.g., *Read 24 books*, *Save $15,000*, *Run 1,000 km*). Includes direct `+1` / `-1` stepper buttons on cards.
  2. **Milestone Checklist**: Break down big annual targets into actionable steps with an interactive checklist viewer.
  3. **Binary Outcome**: Simple achieve/pending outcome for major milestones (e.g., *Launch startup*, *Obtain certification*).
- 🏷️ **Categorized Areas of Focus**:
  - 💼 Career & Work
  - 💰 Finance & Wealth
  - 🏃 Health & Fitness
  - 📚 Personal Growth
  - 👥 Relationships
  - ✈️ Travel & Lifestyle
  - 🎨 Creative & Hobbies
- 📊 **3 Dynamic View Modes**:
  - **Grid View**: Comprehensive overview with interactive cards and quick progress controls.
  - **Quarterly Kanban Board**: Column-by-column breakdown by Q1, Q2, Q3, and Q4.
  - **Compact List View**: High-density scannable list.
- 🔍 **Real-Time Search & Filtering**:
  - Instant text search across targets, descriptions, and subtasks.
  - Filter by Quarter, Category, Priority, and Status.
- 💾 **Data Backup & Restore (JSON)**:
  - 1-click export of your targets to a `.json` backup file.
  - 1-click import to restore or migrate data across devices/browsers.
- 🖨️ **Print & PDF Summary**: Formatted view ready for printing out physical goal sheets.
- 🌓 **Dark & Light Mode**: Ultra-sleek dark theme with glowing accents, plus a crisp light mode.
- 🎉 **Confetti Celebrations**: Built-in celebration animations whenever a target reaches 100%.

---

## 🚀 How to Run

Because Aegis is built purely with HTML, Vanilla CSS, and modern JavaScript, there is no installation or build step needed.

### Option 1: Direct File Open
Simply double-click `index.html` or open it with any web browser (Chrome, Edge, Firefox, Safari, Brave).

### Option 2: Local HTTP Server
Run any lightweight static file server:
```bash
# Python
python -m http.server 3000

# or Node.js / npx
npx serve .
```
Then visit: `http://localhost:3000`

---

## 🗄️ Storage Architecture

All targets and user settings are persisted in `window.localStorage` under the keys:
- `aegis_yearly_targets_data_v1`: Contains an object partitioned by year (e.g. `{ "2026": [ ...targets ] }`).
- `aegis_yearly_settings_v1`: Contains display preferences (active theme, last viewed year, and view mode).

To prevent accidental data loss if you clear browser cookies or change browsers, use the **Data Backup** menu in the top bar to export a timestamped `.json` file at any time.