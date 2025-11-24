import './App.css'
import { Dashboard } from './components/Dashboard'
import { TransactionList } from './components/TransactionList'
import { Subscriptions } from './components/Subscriptions' // Import this

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>💰 MoneyManager</h1>
      </header>
      <main>
        <Dashboard />
        
        {/* New Grid for List + Subs */}
        <div className="content-grid">
           <TransactionList />
           <Subscriptions />
        </div>
      </main>
    </div>
  )
}
export default App
