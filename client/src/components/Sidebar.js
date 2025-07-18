import { useLocation } from "react-router-dom";
import { useState } from "react";
function Sidebar({ isAuthenticated, onLogout }) {
  const location = useLocation();
  const onChatPage = location.pathname === "/chat";

  return (
    <div style={{
      width: 180, background: "#f5f5f5", height: "100vh", padding: 20, boxSizing: "border-box", position: "fixed"
    }}>
      <h3>Menu</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {isAuthenticated && onChatPage && (
          <li>
            <button onClick={onLogout} style={{ marginTop: 10 }}>Logout</button>
          </li>
        )}
        {!isAuthenticated && (
          <>
            <li><a href="/login">Login</a></li>
            <li><a href="/signup">Signup</a></li>
          </>
        )}
        {/* Optionally, show Chat link only if authenticated and not on chat page */}
        {isAuthenticated && !onChatPage && (
          <li>
            <a href="/chat">Chat</a>
          </li>
        )}
      </ul>
    </div>
  );
}

export default Sidebar;