import { useState } from "react";
import SunIcon from "./sunIcon";
import MoonIcon from "./moonIcon";

export default function TypingForm({ onSend, onToggleTheme, onDelete, theme }) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSend(message.trim());
    setMessage("");
  };

  const iconColor = theme === "light_mode" ? "#000000" : "#ffffff";

  return (
    <div className="typing-area">
      <form onSubmit={handleSubmit} className="typing-form">
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Enter a prompt here"
            className="typing-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
          <button type="submit" className="icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              width="24px"
              viewBox="0 -960 960 960"
              fill={iconColor}
            >
              <path d="M120-160v-640l760 320-760 320Zm80-120 451-200-451-200v142l241 58-241 58v142Z" />
            </svg>
          </button>
        </div>

        <div className="action-buttons">
          <span
            onClick={onToggleTheme}
            className="icon"
            style={{ cursor: "pointer" }}
          >
            {theme === "light_mode" ? (
              <MoonIcon color={iconColor} />
            ) : (
              <SunIcon color={iconColor} />
            )}
          </span>

          <span
            onClick={onDelete}
            className="icon"
            style={{ cursor: "pointer" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24px"
              width="24px"
              viewBox="0 -960 960 960"
              fill={iconColor}
            >
              <path d="M280-120q-33 0-56.5-23.5T200-200v-560h-80v-80h240v-40h240v40h240v80h-80v560q0 33-23.5 56.5T680-120H280Zm400-640H280v560h400v-560ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360Z" />
            </svg>
          </span>
        </div>
      </form>

      <p className="disclaimer-text">
        AI may display inaccurate info, including about people, so double-check
        its responses.
      </p>
    </div>
  );
}
