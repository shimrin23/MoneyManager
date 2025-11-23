import './App.css'
import { Dashboard } from './components/Dashboard'
import { TransactionList } from './components/TransactionList'

function App() {
  return (
    <div className="app-container">
      <header>
        <h1>💰 MoneyManager</h1>
      </header>
      <main>
        <Dashboard />
        <TransactionList />
      </main>
    </div>
  )
}
export default App
