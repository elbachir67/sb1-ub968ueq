import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Message } from "../types";
import { useNavigate } from "react-router-dom";

interface ChatInterfaceProps {
  messages: Message[];
  onSend: (message: string) => void;
  onOptionSelect?: (option: string) => void;
  isTyping?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSend,
  onOptionSelect,
  isTyping = false,
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isTyping) {
      const message = input.trim();
      setInput("");
      await onSend(message);
    }
  };

  const handleOptionClick = async (option: string) => {
    if (isTyping) return;

    if (option === "Explorer les objectifs recommandés") {
      navigate("/goals");
      return;
    }

    if (option === "Revenir à l'accueil") {
      navigate("/");
      return;
    }

    if (option === "Se connecter") {
      navigate("/login");
      return;
    }

    await onOptionSelect?.(option);
  };

  return (
    <div className="flex flex-col h-[600px] bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
      {/* Chat Header */}
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Bot className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-100">Assistant IA</h3>
            <p className="text-sm text-gray-400">Évaluation personnalisée</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${
              message.type === "user" ? "justify-end" : "justify-start"
            } animate-slideIn`}
          >
            <div
              className={`flex max-w-[80%] ${
                message.type === "user"
                  ? "flex-row-reverse items-end"
                  : "items-start"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 ${
                  message.type === "user" ? "ml-3" : "mr-3"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.type === "user"
                      ? "bg-blue-500/20"
                      : "bg-purple-500/20"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-purple-400" />
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div
                className={`flex flex-col space-y-2 ${
                  message.type === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-lg p-3 ${
                    message.type === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-100"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line">
                    {message.content}
                  </p>
                </div>

                {/* Options */}
                {message.options && message.options.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {message.options.map((option, i) => (
                      <button
                        key={`${message.id}-option-${i}`}
                        onClick={() => handleOptionClick(option)}
                        disabled={isTyping}
                        className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-gray-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}

                {/* Custom Component */}
                {message.component && (
                  <div className="w-full">{message.component}</div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex items-center space-x-2 text-gray-400 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">L'assistant écrit...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-4 bg-gray-800 border-t border-gray-700"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Écrivez votre message..."
            disabled={isTyping}
            className="flex-1 bg-gray-900 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
