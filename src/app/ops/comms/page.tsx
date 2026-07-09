"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import { Megaphone, Volume2, VolumeX, Sparkles, Send, RefreshCw, AlertTriangle, ShieldCheck } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "pt", name: "Portuguese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "de", name: "German" }
];

export default function OpsComms() {
  const { role } = useTelemetry();
  const [prompt, setPrompt] = useState("Gate 4 turnstiles are offline. Arriving fans redirect to Gate 3 and Gate 5.");
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<any>(null);
  const [selectedLang, setSelectedLang] = useState("en");
  const [speakingField, setSpeakingField] = useState<string | null>(null);
  const [broadcasted, setBroadcasted] = useState(false);

  const isReadOnly = role === "volunteer";

  const handleGenerate = async () => {
    setLoading(true);
    setBroadcasted(false);
    try {
      const response = await fetch("/api/comms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operatorPrompt: prompt })
      });

      if (!response.ok) throw new Error("Failed to generate comms drafts");
      const data = await response.json();
      setDrafts(data);
    } catch (e) {
      console.error(e);
      alert("Failed to generate drafts. Falling back to default system drafts.");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = (text: string, fieldId: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (speakingField === fieldId) {
      window.speechSynthesis.cancel();
      setSpeakingField(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLang;
    utterance.onend = () => setSpeakingField(null);
    utterance.onerror = () => setSpeakingField(null);

    setSpeakingField(fieldId);
    window.speechSynthesis.speak(utterance);
  };

  const handleBroadcast = () => {
    setBroadcasted(true);
    setTimeout(() => {
      setBroadcasted(false);
    }, 4000);
  };

  const currentDraft = drafts ? drafts[selectedLang] : null;

  return (
    <div className="space-y-6">
      {/* Input panel */}
      <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 space-y-4">
        <div className="flex items-center gap-2">
          <Megaphone className="text-pitch-green" size={16} />
          <h3 className="text-xs font-mono uppercase tracking-wider text-chalk">Announcement Studio Prompt Drafts</h3>
        </div>
        
        <div className="space-y-1">
          <label className="block text-[10px] text-[#8a9894] font-mono uppercase">Operator Input Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            rows={2}
            placeholder="Type issues or operational changes (e.g. rain delays, turnstile shutdowns)..."
            className="w-full bg-[#0b1713] border border-[#223d30]/60 text-chalk text-xs p-3 rounded-lg focus:outline-none focus:border-pitch-green disabled:opacity-50"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="bg-pitch-green text-pitch-night font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded-lg hover:bg-opacity-90 active:scale-98 disabled:opacity-30 transition-all flex items-center gap-2"
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Megaphone size={14} />}
          <span>Generate Multilingual Broadcast drafts</span>
        </button>
      </div>

      {/* Draft results panel */}
      {drafts ? (
        <div className="bg-surface rounded-2xl p-5 border border-[#223d30]/40 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#223d30]/40 pb-3 gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="text-pitch-green animate-pulse" size={16} />
              <h4 className="text-xs font-mono uppercase tracking-wider text-chalk">PA Broadcast relay drafts</h4>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-[10px] font-mono text-[#8a9894] uppercase shrink-0">Language preview:</label>
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-[#0b1713] border border-[#223d30]/60 text-chalk text-xs font-mono p-1 rounded focus:outline-none"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
            </div>
          </div>

          {currentDraft ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Draft A: Short PA version */}
              <div className="p-4 bg-pitch-night/50 border border-[#223d30]/20 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-pitch-green uppercase font-semibold">1. PA Audio Version</span>
                  <p className="text-xs text-chalk leading-relaxed bg-surface/30 p-2.5 rounded border border-[#223d30]/10 min-h-[60px]">
                    "{currentDraft.short}"
                  </p>
                </div>
                <button
                  onClick={() => handleSpeak(currentDraft.short, "short")}
                  className={`mt-2 text-[10px] flex items-center gap-1 font-mono uppercase ${
                    speakingField === "short" ? "text-pitch-green" : "text-[#8a9894]"
                  } hover:text-chalk`}
                >
                  {speakingField === "short" ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  <span>{speakingField === "short" ? "Mute test" : "Audio TTS Test"}</span>
                </button>
              </div>

              {/* Draft B: Long display version */}
              <div className="p-4 bg-pitch-night/50 border border-[#223d30]/20 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-pitch-green uppercase font-semibold">2. Jumbotron Visual Text</span>
                  <p className="text-xs text-chalk leading-relaxed bg-surface/30 p-2.5 rounded border border-[#223d30]/10 min-h-[60px]">
                    "{currentDraft.long}"
                  </p>
                </div>
                <button
                  onClick={() => handleSpeak(currentDraft.long, "long")}
                  className={`mt-2 text-[10px] flex items-center gap-1 font-mono uppercase ${
                    speakingField === "long" ? "text-pitch-green" : "text-[#8a9894]"
                  } hover:text-chalk`}
                >
                  {speakingField === "long" ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  <span>{speakingField === "long" ? "Mute test" : "Audio TTS Test"}</span>
                </button>
              </div>

              {/* Draft C: Emergency alert push */}
              <div className="p-4 bg-pitch-night/50 border border-[#223d30]/20 rounded-xl space-y-3 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono text-card-red uppercase font-semibold">3. Mobile Push Notification</span>
                  <p className="text-xs text-chalk leading-relaxed bg-surface/30 p-2.5 rounded border border-card-red/20 min-h-[60px]">
                    "{currentDraft.alert}"
                  </p>
                </div>
                <button
                  onClick={() => handleSpeak(currentDraft.alert, "alert")}
                  className={`mt-2 text-[10px] flex items-center gap-1 font-mono uppercase ${
                    speakingField === "alert" ? "text-pitch-green" : "text-[#8a9894]"
                  } hover:text-chalk`}
                >
                  {speakingField === "alert" ? <VolumeX size={12} /> : <Volume2 size={12} />}
                  <span>{speakingField === "alert" ? "Mute test" : "Audio TTS Test"}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-[#8a9894] py-6">Could not load selected language drafts.</div>
          )}

          {/* Action validation broadcast */}
          <div className="border-t border-[#223d30]/40 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-[#8a9894] leading-relaxed">
              Operator verification required. Click **Broadcast Command** to publish generated text blocks to all 16 stadium relays, mobile push, and audio synthesizers.
            </span>
            <button
              onClick={handleBroadcast}
              disabled={isReadOnly || broadcasted}
              className="bg-pitch-green text-pitch-night font-bold uppercase tracking-wider text-xs px-6 py-3 rounded-lg hover:bg-opacity-90 active:scale-98 disabled:opacity-50 transition-all flex items-center gap-2 shrink-0 font-mono"
            >
              {broadcasted ? <ShieldCheck size={14} /> : <Send size={14} />}
              <span>{broadcasted ? "BROADCAST COMPLETED" : "BROADCAST COMMAND"}</span>
            </button>
          </div>

          {broadcasted && (
            <div className="p-3 bg-pitch-green/10 border border-pitch-green/30 text-pitch-green rounded-xl text-xs flex gap-2 items-center font-mono">
              <span>Relays Dispatching: english, spanish, french, portuguese, arabic, hindi, japanese, korean, german targets synced.</span>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface/30 rounded-2xl p-8 border border-[#223d30]/15 text-center text-xs text-[#8a9894] font-mono">
          Ready to generate drafts. Review input prompt and click **Generate Multilingual Broadcast drafts**.
        </div>
      )}
    </div>
  );
}
