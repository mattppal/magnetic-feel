import ElectricFieldVisualizer from './components/ElectricFieldVisualizer'
import './App.css'
import { ThemeProvider } from './components/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="electric-field-theme">
      <div className="App">
        <ElectricFieldVisualizer />
      </div>
    </ThemeProvider>
  )
}

export default App