import { Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home/Home'

function App() {
    return (
        <div className="bg-gray-50 w-[100%] h-[100vh]">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<h1>404, not found.</h1>} />
            </Routes>
        </div>
    )
}

export default App
