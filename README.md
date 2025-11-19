# Smart Task Manager

## Overview

**Smart Task Manager** is a full-stack web application designed to streamline team-based project and task management. It provides an efficient way to manage projects, organize teams, assign and balance workloads, and track progress across members. The app focuses on practical task distribution with real-time reassignment capabilities to ensure that no team member is overloaded.

---

## Problem It Solves

In many teams, uneven task distribution leads to inefficiency and burnout, while others remain underutilized. Managers often struggle to manually track each member’s workload capacity and reassign tasks effectively. **Smart Task Manager** addresses this by automating task balancing and simplifying team coordination.

It helps users:

* Create teams with defined member capacities.
* Assign tasks based on workload visibility.
* Automatically redistribute tasks when members exceed their capacity.
* Maintain a transparent log of all task reassignments for accountability.

---

## Key Features

### 1. User and Team Management

* User registration and login system.
* Team creation with manual member addition (no email required).
* Each member has:

  * Name
  * Role
  * Capacity (0–5 tasks)

### 2. Project and Task Management

* Create multiple projects linked to teams.
* Add, edit, delete, and filter tasks by project or member.
* Each task includes:

  * Title and Description
  * Assigned Member or “Unassigned”
  * Priority: Low, Medium, or High
  * Status: Pending, In Progress, or Done

### 3. Intelligent Task Assignment

* While assigning tasks, see each member’s current workload (current tasks vs. capacity).
* Warnings appear if a member is over capacity.
* “Auto-assign” option selects the member with the least load.

### 4. Auto Task Reassignment

* One-click **“Reassign Tasks”** button redistributes excess tasks automatically.
* High-priority tasks remain with the original assignee.
* Only Low and Medium priority tasks are moved.
* Changes are logged for review in the Activity Log.

### 5. Dashboard and Insights

* Display of total projects, total tasks, and member workload summary.
* Overloaded members are visually flagged.
* Recent reassignments and the latest activity logs (5–10 entries) are shown on the dashboard.

### 6. Activity Log

* Every reassignment is recorded with a timestamp and task details, for example:
  *10:30 AM — Task “UI Design” reassigned from Riya to Farhan.*

---

## Tech Stack

### Frontend

* **React 19**
* **Vite**
* **Tailwind CSS 4**
* **React Router DOM 7**
* **Axios**
* **React Hot Toast** for notifications
* **Heroicons** for UI icons

### Backend

* **Node.js** with **Express**
* **MongoDB** with **Mongoose**
* **JWT** for authentication
* **bcryptjs** for password hashing
* **dotenv**, **cookie-parser**, **cors** for configuration and middleware

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/NajibHossain49/smart_task_manager.git
cd smart_task_manager
```

### 2. Setup Backend

```bash
cd  server
npm install
npm run dev
```

### 3. Setup Frontend

```bash
cd  client
npm install
npm run dev
```

### 4. Environment Variables

Create a `.env` file in the backend directory as well as frontend directory:

**backend**
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key_here
NODE_ENV=development

```
**frontend**
```
VITE_API_URL=your_backend_api_URL

```

---

## Future Enhancements

1. **Email and Notification System**
   Notify team members when tasks are assigned or reassigned.

2. **Drag-and-Drop Task Board**
   Interactive Kanban-style board for task visualization.

3. **Advanced Analytics**
   Charts and performance metrics showing team efficiency and task completion trends.

4. **Role-Based Access Control**
   Separate admin, manager, and member privileges for better workflow management.

5. **Calendar Integration**
   Sync tasks and deadlines with Google Calendar or Outlook.

---

## Summary

**Smart Task Manager** is a scalable and intuitive task management system that helps teams stay organized, balanced, and productive. With its built-in workload tracking and automated reassignment logic, it offers a smarter way to manage projects and ensure fair task distribution across teams.

---

## 🧑‍💻 Author

Developed with ❤️ by **Najib Hossain**  
[GitHub](https://github.com/NajibHossain49) | [LinkedIn](https://www.linkedin.com/in/md-najib-hossain)

## 🌟 Show Your Support

If you like this project, please ⭐ the repository and share it with others!