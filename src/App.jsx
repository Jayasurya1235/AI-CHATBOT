import { useState, useEffect } from "react";
import ChatList from "./components/ChatList.jsx";
import TypingForm from "./components/TypingForm.jsx";
import { handleStreamingResponse } from "./utils/parseStreamResponse.js";
import "./style.css";

const API_KEY = import.meta.env.VITE_API_KEY;

const API_URL = `https://aiplatform.googleapis.com/v1/publishers/google/models/gemini-2.5-flash-lite:streamGenerateContent?key=${API_KEY}`;

function App() {
  const [chats, setChats] = useState([]);
  const [theme, setTheme] = useState("dark_mode");
  const [isLoading, setIsLoading] = useState(false);
  console.log("chats:", chats);

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

  const sendToGemini = async (userMessage, retryCount = 0) => {
    setIsLoading(true);

    // Only add the user message to the chat on the first attempt
    if (retryCount === 0) {
      setChats((prev) => [...prev, { type: "user", text: userMessage }]);
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
        }),
      });

      // HANDLE 429 ERROR (Rate Limit)
      if (response.status === 429 && retryCount < 3) {
        const waitTime = Math.pow(2, retryCount) * 2000; // Wait 2s, 4s, 8s
        console.warn(`Rate limit hit. Retrying in ${waitTime}ms...`);

        await new Promise(resolve => setTimeout(resolve, waitTime));
        return sendToGemini(userMessage, retryCount + 1); // Recursive retry
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error?.message || "Something went wrong");
      }

      // Handle streaming response - pass the entire response object
      const apiResponse = await handleStreamingResponse(response);
      
      console.log("API Response received:", {
        length: apiResponse.length,
        empty: apiResponse.trim() === "",
        value: apiResponse
      });
      
      if (!apiResponse || apiResponse.trim() === "") {
        throw new Error("Empty response from AI. Please try again.");
      }
      
      const cleanedResponse = apiResponse.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      
      console.log("Setting chat with cleaned response:", cleanedResponse);
      
      setChats((prev) => {
        const updated = [...prev, { type: "ai", text: cleanedResponse }];
        console.log("State updated with chats:", updated);
        return updated;
      });

    } catch (error) {
      // Only show the error if we've exhausted retries or it's a different error
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
