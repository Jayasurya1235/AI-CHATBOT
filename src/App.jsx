import { useState, useEffect } from "react";
import ChatList from "./components/ChatList.jsx";
import TypingForm from "./components/TypingForm.jsx";
import "./style.css";

const API_KEY = "ENTER YOUR API KEY"; // 🔐 Don't expose in production
const API_URL = ` https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

function App() {
  const [chats, setChats] = useState([]);
  const [theme, setTheme] = useState("dark_mode");
  const [isLoading, setIsLoading] = useState(false);

  // Load saved chats and theme
  useEffect(() => {
    const savedChats = localStorage.getItem("saved-chats");
    const savedTheme = localStorage.getItem("themeColor") || "dark_mode";
    if (savedChats) setChats(JSON.parse(savedChats));
    setTheme(savedTheme);
    document.body.classList.toggle("light_mode", savedTheme === "light_mode");
  }, []);

  // Save chats to localStorage
  useEffect(() => {
    localStorage.setItem("saved-chats", JSON.stringify(chats));
  }, [chats]);

  const toggleTheme = () => {
    const newTheme = theme === "light_mode" ? "dark_mode" : "light_mode";
    setTheme(newTheme);
    localStorage.setItem("themeColor", newTheme);
    document.body.classList.toggle("light_mode", newTheme === "light_mode");
  };

  const deleteChats = () => {
    if (confirm("Are you sure you want to delete all the chats?")) {
      setChats([]);
      localStorage.removeItem("saved-chats");
    }
  };

  const sendToGemini = async (userMessage) => {
    setIsLoading(true);
    setChats((prev) => [...prev, { type: "user", text: userMessage }]);
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error.message);

      const apiResponse = data?.candidates[0].content.parts[0].text.replace(
        /\*\*(.*?)\*\*/g,
        "$1"
      );
      setChats((prev) => [...prev, { type: "ai", text: apiResponse }]);
    } catch (error) {
      setChats((prev) => [...prev, { type: "error", text: error.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        {chats.length === 0 && (
          <>
            <h1 className="title">Hello, there</h1>
            <p className="subtitle">How can I help you today?</p>
          </>
        )}
      </header>
      <ChatList chats={chats} isLoading={isLoading} />
      <TypingForm
        onSend={sendToGemini}
        onToggleTheme={toggleTheme}
        onDelete={deleteChats}
        theme={theme}
      />
    </div>
  );
}

export default App;
