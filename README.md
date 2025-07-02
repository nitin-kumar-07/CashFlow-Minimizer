📌 Project Description
Cashflow Minimizer is a lightweight web-based application designed to help users record, track, and settle shared expenses within a group. It aims to minimize the total number of transactions needed for settlement by optimizing who owes whom, making it ideal for roommates, friends on trips, or any collaborative group where financial sharing is common.

Built using HTML, CSS (Tailwind), and JavaScript, the app runs fully in-browser using localStorage for persistence—meaning users can use it offline without any backend dependency.


🚀 Key Features
✅ Add Transactions: Record who paid, how much, and for whom.

🔁 Minimized Settlements: Automatically calculates the most efficient way to settle all dues.

🧮 Cycle Detection: Optional logic to identify and resolve circular debts.

📜 Transaction History: View a complete log of past transactions.

🔐 Simple Login: Users can log in with a name (stored in localStorage for session simulation).

🎨 Responsive UI: Built with Tailwind CSS for clean and mobile-friendly design.



🧠 Project Implementation –

🔸 1. Frontend Design (HTML + Tailwind CSS)
The user interface is built using HTML for structure and Tailwind CSS for styling.

Pages include:

index.html: Dashboard for adding and settling transactions.

login.html: Simple login screen.

history.html: Displays transaction history.

Tailwind classes ensure responsive and modern design.


🔸 2. LocalStorage-based Data Persistence
All data is stored in the browser’s localStorage, including:

Username

Group members and transactions

History logs

This ensures the app works offline and keeps data across sessions, but only on the same device.


🔸 3. Transaction Logic (JavaScript)
Core logic is implemented in two files:

script.js: Manages UI events, DOM manipulation, and transaction inputs.

logic.js: Contains the logic for calculating debts, simplifying balances, and optimizing settlements.

Logic Workflow:
Convert all transactions into a net balance sheet.

Apply a greedy settlement algorithm to minimize the number of required transactions.

Display optimized settlement instructions (who should pay whom and how much).


🔸 4. Cycle Detection & Optimization
Cycles like A→B→C→A are automatically detected and removed from the transaction graph.

This prevents redundant payments and ensures only the minimum necessary transactions occur.


🔸 5. Transaction History Tracking
Each transaction is stored with details like payer, amount, participants, and timestamp.

The history is retrieved and displayed in a readable format on history.html.

🔸 6. Basic Login System
The login page stores the username in localStorage to simulate a user session.


⚠️ Limitations (Current Version)

No backend or cloud database support

No real user authentication

Data is device-specific and doesn't sync across users


🌱 Future Scope / Enhancements

Add backend using Node.js + MongoDB for multi-user support

Implement JWT-based authentication system

Real-time updates using Socket.io

Add charts and dashboards using Chart.js or Recharts

Export data to CSV/PDF

Support group invites and email notifications
