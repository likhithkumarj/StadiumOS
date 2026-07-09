"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import { Send, Mic, MicOff, Volume2, VolumeX, Sparkles, RefreshCw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "es", name: "Spanish", nativeName: "Español" },
  { code: "fr", name: "French", nativeName: "Français" },
  { code: "pt", name: "Portuguese", nativeName: "Português" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "ko", name: "Korean", nativeName: "한국어" },
  { code: "de", name: "German", nativeName: "Deutsch" }
];

const SUGGESTIONS: { [lang: string]: string[] } = {
  en: ["Where is Gate 1?", "What is the bag size policy?", "Is there wheelchair access?", "Are there sensory rooms?"],
  es: ["¿Dónde está la Puerta 1?", "¿Cuál es la política de maletas?", "¿Hay acceso para sillas?", "¿Hay salas sensoriales?"],
  fr: ["Où est la Porte 1?", "Quelle est la taille de sac?", "Y a-t-il un accès PMR?", "Y a-t-il des espaces sensoriels?"],
  pt: ["Onde fica o Portão 1?", "Qual é a política de bolsas?", "Existe acesso para cadeirantes?", "Existem salas sensoriais?"],
  ar: ["أين تقع البوابة 1؟", "ما هي سياسة أحجام الحقائب؟", "هل يوجد ممر للكراسي المتحركة؟", "هل توجد غرف حسية؟"],
  hi: ["गेट 1 कहाँ है?", "बैग का आकार नियम क्या है?", "क्या व्हीलचेयर सुविधा है?", "क्या संवेदी कक्ष हैं?"],
  ja: ["ゲート1はどこですか？", "バッグのサイズ制限は？", "車椅子用のアクセスはありますか？", "センサリールームはありますか？"],
  ko: ["1번 게이트는 어디에 있나요?", "가방 크기 제한은 무엇인가요?", "휠체어 이용이 가능한가요?", "감각 치유실이 있나요?"],
  de: ["Wo ist Tor 1?", "Wie groß dürfen Taschen sein?", "Gibt es Rollstuhlzugang?", "Gibt es sensorische Räume?"]
};

export default function FanAssist() {
  const { isOffline } = useTelemetry();
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hello! I am your StadiumOS AI Concierge. How can I help you navigate the stadium today?" }
  ]);
  const [input, setInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  
  // Speech Recognition (STT) state
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Audio Speech Synthesis (TTS) state
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = selectedLanguage;

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        rec.onerror = (e: any) => {
          console.error("Speech recognition error:", e);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, [selectedLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported on this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setInput("");
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakText = (text: string, idx: number) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage;
    utterance.onend = () => setSpeakingIdx(null);
    utterance.onerror = () => setSpeakingIdx(null);
    
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: "user", content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages })
      });

      if (!response.ok) {
        throw new Error("Failed to fetch chat stream");
      }

      // Read stream reader
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("No stream reader");

      // Place empty assistant bubble
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      let assistantText = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        assistantText += chunk;
        
        // Update the last message in state
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: assistantText };
          return updated;
        });
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please check your internet connection or API settings." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = () => {
    return SUGGESTIONS[selectedLanguage] || SUGGESTIONS.en;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4">
      {/* Top Options Bar */}
      <div className="bg-surface rounded-xl p-3 border border-[#223d30]/40 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#8a9894] font-mono">
          <Sparkles size={14} className="text-pitch-green animate-pulse" />
          <span>Concierge Copilot</span>
        </div>

        <select
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
          className="bg-pitch-night border border-[#223d30]/60 text-chalk text-xs p-1.5 rounded-lg focus:outline-none font-mono"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.nativeName} ({lang.name})
            </option>
          ))}
        </select>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 min-h-[300px] overflow-y-auto no-scrollbar space-y-3 bg-[#070e0b]/40 rounded-xl p-3 border border-[#223d30]/10 flex flex-col justify-end">
        <div className="overflow-y-auto max-h-[360px] space-y-3 flex-1">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[85%] ${
                msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-pitch-green text-pitch-night rounded-tr-none font-semibold shadow-md"
                    : "bg-surface border border-[#223d30]/40 text-chalk rounded-tl-none"
                }`}
              >
                {msg.content}
              </div>

              {/* TTS Read Aloud Control (Only for Assistant bubbles) */}
              {msg.role === "assistant" && msg.content && (
                <button
                  onClick={() => speakText(msg.content, idx)}
                  className={`mt-1 text-[9px] flex items-center gap-1 font-mono uppercase ${
                    speakingIdx === idx ? "text-pitch-green" : "text-[#8a9894]"
                  } hover:text-chalk transition-all`}
                >
                  {speakingIdx === idx ? <VolumeX size={10} /> : <Volume2 size={10} />}
                  <span>{speakingIdx === idx ? "Mute speech" : "Read aloud"}</span>
                </button>
              )}
            </div>
          ))}
          {loading && (
            <div className="mr-auto flex items-center gap-1.5 p-3 rounded-2xl bg-surface border border-[#223d30]/30 text-[#8a9894] text-xs">
              <RefreshCw size={12} className="animate-spin text-pitch-green" />
              <span>AI is generating response...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions shortcuts */}
      {messages.length === 1 && (
        <div className="space-y-1.5">
          <span className="text-[9px] text-[#8a9894] font-mono uppercase block tracking-wider">Suggested Inquiries</span>
          <div className="grid grid-cols-2 gap-2">
            {getSuggestions().map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(sug)}
                className="p-2 text-[10px] text-left text-chalk bg-surface hover:bg-[#1a382a] border border-[#223d30]/30 rounded-lg active:scale-98 transition-all truncate"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input controls box */}
      <div className="bg-surface rounded-xl p-2 border border-[#223d30]/40 flex items-center gap-2">
        <button
          onClick={toggleListening}
          className={`p-2.5 rounded-lg border transition-all ${
            isListening
              ? "bg-card-red border-card-red text-chalk animate-pulse"
              : "bg-pitch-night border-[#223d30]/60 text-chalk hover:border-pitch-green/60"
          }`}
          title={isListening ? "Stop listening" : "Start Voice Input"}
        >
          {isListening ? <MicOff size={16} /> : <Mic size={16} />}
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
          placeholder={isListening ? "Listening..." : "Ask StadiumOS AI..."}
          disabled={loading || isListening}
          className="flex-1 bg-pitch-night text-xs text-chalk p-2 rounded-lg border border-[#223d30]/60 focus:outline-none focus:border-pitch-green disabled:opacity-50"
        />

        <button
          onClick={() => handleSend(input)}
          disabled={loading || isListening || !input.trim()}
          className="p-2.5 bg-pitch-green text-pitch-night rounded-lg hover:bg-opacity-90 active:scale-98 transition-all disabled:opacity-30 disabled:hover:bg-pitch-green"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
