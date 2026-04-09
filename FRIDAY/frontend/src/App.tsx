import { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Mic, MicOff, Terminal as TermIcon, BrainCircuit } from 'lucide-react';
import { useWebSocket } from './hooks/useWebSocket';
import { useAudio } from './hooks/useAudio';
import { CoreVisualizer } from './components/CoreVisualizer';

function App() {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<string[]>(['[SYSTEM] Initializing FRIDAY protocol...']);
  
  const { isConnected, sendMessage, lastMessage } = useWebSocket('ws://localhost:8000/ws');
  
  // Example of using the audio hook to send binary streaming audio
  const { isRecording, startRecording, stopRecording } = useAudio((blob) => {
    // In a full implementation, you would send this to the WEBSOCKET for STT
    // sendBinary(blob);
    console.log("Audio chunk ready", blob.size);
  });

  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'agent_response') {
        addLog(`[FRIDAY] ${lastMessage.text}`);
        
        // Play the speech if ElevenLabs returned audio bytes
        if (lastMessage.audio) {
          const audio = new Audio(`data:audio/mp3;base64,${lastMessage.audio}`);
          audio.play().catch(console.error);
        }
      } else {
        addLog(`[SYSTEM] ${JSON.stringify(lastMessage)}`);
      }
    }
  }, [lastMessage]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg].slice(-10));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;
    
    addLog(`[USER] ${command}`);
    sendMessage({ command });
    setCommand('');
  };

  return (
    <div className="w-screen h-screen bg-hologram flex flex-col relative font-mono">
      {/* 3D Core Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 4] }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <CoreVisualizer isActive={isRecording || lastMessage?.status === 'processing'} />
          <Environment preset="city" />
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        </Canvas>
      </div>

      {/* UI Overlay */}
      <div className="relative z-10 flex flex-col h-full p-6 mask-image-gradient">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <BrainCircuit className="text-friday-blue w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-widest text-friday-blue drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]">
              F.R.I.D.A.Y.
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />
            <span className="text-sm opacity-70 border border-white/20 px-2 py-1 rounded bg-black/40 backdrop-blur">
              {isConnected ? 'UPLINK ESTABLISHED' : 'OFFLINE'}
            </span>
          </div>
        </header>

        {/* HUD Logs */}
        <div className="flex-1 overflow-hidden pointer-events-none">
          <div className="max-w-xl flex flex-col gap-2">
             {logs.map((log, i) => (
               <div key={i} className="text-white/80 text-sm whitespace-pre-wrap animate-in slide-in-from-left max-w-lg backdrop-blur-md bg-black/30 p-2 border-l-2 border-friday-blue">
                 {log}
               </div>
             ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="mt-auto max-w-3xl mx-auto w-full">
          <form onSubmit={handleSubmit} className="flex items-center gap-4 bg-black/50 backdrop-blur-xl p-4 rounded-2xl border border-friday-blue/30 shadow-[0_0_30px_rgba(0,243,255,0.1)]">
            <TermIcon className="text-friday-blue" />
            <input 
              type="text" 
              value={command}
              onChange={e => setCommand(e.target.value)}
              placeholder="Enter command directive or 'Hey Friday'..."
              className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/40"
            />
            
            <button 
              type="button"
              onClick={isRecording ? stopRecording : startRecording}
              className={`p-3 rounded-full transition-all duration-300 ${isRecording ? 'bg-red-500/20 text-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-friday-blue/10 text-friday-blue hover:bg-friday-blue/20'}`}
            >
              {isRecording ? <MicOff /> : <Mic />}
            </button>
            <button type="submit" className="px-6 py-2 bg-friday-blue text-black font-semibold rounded hover:bg-white transition-colors duration-300">
              EXECUTE
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
