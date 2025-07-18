import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./pages/Login.js";
import Signup from "./pages/Signup.js";
import Chat from "./pages/Chat.js";
import SocketProvider from './contextAPI/Socketprovider';

function App() {
  return (
    <SocketProvider>
    <BrowserRouter>
    
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<Chat />} />
      </Routes>
      
    </BrowserRouter>
    </SocketProvider>
  );
}

export default App;
