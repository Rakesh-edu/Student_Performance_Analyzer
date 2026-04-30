# Student Performance Analyzer

This is a frontend project I built using React.js to track and analyze student performance.  
The main idea was to create a simple system where a student can enter marks, see progress over time, and understand where they need to improve.

---

## Live Demo
https://student-performance-analyzer-fn77.vercel.app/

---

## Tech Used

- React.js  
- Tailwind CSS  
- Recharts (for graphs)  
- LocalStorage (for saving data) also API

---

## What the project does

- Users can sign up and log in (no backend required)
- Add subjects and enter marks
- View performance using charts (bar, line, pie)
- Track improvement over time
- See rank compared to classmates
- Get basic insights like:
  - weak subjects  
  - strong subjects  
  - overall performance  
- Settings page to update profile and reset data

---

## How it works

All the data is stored in localStorage, so the app works even without a backend.  
I also handled cases where API might fail by falling back to localStorage.

---

## Why I built this

I wanted to build something more than a basic CRUD app.  
This project helped me understand:
- how to manage state in React
- how to work with charts and data visualization
- how to handle real-world issues like missing backend
- how to structure a multi-page application

---

## What I learned

- Using React hooks properly (useState, useEffect, useMemo)
- Handling edge cases like empty data or missing user
- Managing user data without a backend
- Building a complete UI with multiple features

---

## Future improvements

- Add backend (Node.js or Django)
- Add authentication system
- Store data in a real database
- Improve UI and responsiveness

---

## Author

Rakesh Banavath