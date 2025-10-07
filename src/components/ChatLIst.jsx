import { useEffect, useRef } from "react";
import avatar from "../assets/avatar.png";
import geminiAvatar from "../assets/downloads.png";

export default function chatList({ chats, isLoading }) {
  const chatRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chats, isLoading]);

  return (
    <div className="chat-list" ref={chatRef}>
      {chats.map((chat, index) => (
        <div
          key={index}
          className={`message ${
            chat.type === "user"
              ? "outgoing"
              : chat.type === "ai"
              ? "incoming"
              : "error"
          }`}
        >
          <div className="message-content">
            <img
              className="avatar"
              src={chat.type === "user" ? avatar : geminiAvatar}
              alt={chat.type === "user" ? "User avatar" : "Gemini avatar"}
            />
            <p className="text">{chat.text}</p>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="message incoming loading">
          <div className="message-content">
            <img className="avatar" src={geminiAvatar} alt="Gemini avatar" />
            <div className="loading-indicator">
              <div className="loading-bar"></div>
              <div className="loading-bar"></div>
              <div className="loading-bar"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
