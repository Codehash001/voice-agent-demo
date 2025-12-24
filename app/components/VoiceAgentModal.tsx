"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  BarVisualizer,
  DisconnectButton,
} from "@livekit/components-react";
import "@livekit/components-styles";
import { X, Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface VoiceAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessName: string;
  businessId?: string;
}

function AgentControlBar() {
  const { state, audioTrack } = useVoiceAssistant();
  
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-[100px] w-full flex items-center justify-center">
        <BarVisualizer
          state={state}
          trackRef={audioTrack}
          barCount={5}
          options={{ minHeight: 10 }}
        />
      </div>
      <p className="text-sm text-gray-500 capitalize">
        {state === "listening" && "Listening..."}
        {state === "thinking" && "Thinking..."}
        {state === "speaking" && "Speaking..."}
        {state === "idle" && "Ready"}
        {state === "connecting" && "Connecting..."}
        {state === "disconnected" && "Disconnected"}
      </p>
    </div>
  );
}

function ActiveCall({ onDisconnect }: { onDisconnect: () => void }) {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          AI Dental Assistant
        </h3>
        <p className="text-sm text-gray-500">Bright Smiles Dental</p>
      </div>

      <AgentControlBar />

      <div className="flex gap-4">
        <Button
          variant="outline"
          size="icon"
          className={`rounded-full h-12 w-12 ${
            isMuted ? "bg-red-100 text-red-600" : ""
          }`}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </Button>
        <DisconnectButton>
          <Button
            variant="destructive"
            size="icon"
            className="rounded-full h-12 w-12"
            onClick={onDisconnect}
          >
            <PhoneOff size={20} />
          </Button>
        </DisconnectButton>
      </div>

      <RoomAudioRenderer />
    </div>
  );
}

export default function VoiceAgentModal({
  isOpen,
  onClose,
  businessName,
  businessId,
}: VoiceAgentModalProps) {
  const [token, setToken] = useState<string>("");
  const [wsUrl, setWsUrl] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string>("");

  const roomNameRef = useRef(`dental-${Date.now()}-${Math.random().toString(36).substring(7)}`);
  const participantNameRef = useRef(`user-${Math.random().toString(36).substring(7)}`);

  const startCall = useCallback(async () => {
    const roomName = roomNameRef.current;
    const participantName = participantNameRef.current;
    setIsConnecting(true);
    setError("");

    try {
      const response = await fetch("/api/livekit-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName, participantName, businessId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to get token");
      }

      const data = await response.json();
      setToken(data.token);
      setWsUrl(data.wsUrl);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected(false);
    setToken("");
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) {
      setIsConnected(false);
      setToken("");
      setError("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 relative overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10"
          onClick={onClose}
        >
          <X size={20} />
        </Button>

        {!isConnected ? (
          <div className="flex flex-col items-center gap-6 p-8">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone size={32} className="text-blue-600" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                Test AI Agent
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {businessName}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Talk to our AI dental assistant to schedule appointments
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-lg">
                {error}
              </p>
            )}

            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={startCall}
              disabled={isConnecting}
            >
              {isConnecting ? (
                "Connecting..."
              ) : (
                <>
                  <Phone size={18} className="mr-2" />
                  Start Call
                </>
              )}
            </Button>
          </div>
        ) : (
          <LiveKitRoom
            token={token}
            serverUrl={wsUrl}
            connect={true}
            audio={true}
            video={false}
            onDisconnected={handleDisconnect}
          >
            <ActiveCall onDisconnect={handleDisconnect} />
          </LiveKitRoom>
        )}
      </Card>
    </div>
  );
}
