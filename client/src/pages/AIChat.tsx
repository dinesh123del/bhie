import { useState, useRef, useEffect } from 'react';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';

import { Send, Bot, AlertTriangle, TrendingUp, Activity, Download } from 'lucide-react';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { generateBrandedPDF } from '../utils/pdfGenerator';


interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SmartChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStrategicInsights();
    scrollToBottom();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadStrategicInsights = async () => {
    try {
      const insightsRes = await api.get('/ai/insights');
      setInsights(insightsRes.data);

      const predRes = await api.get('/ai/prediction');
      setPrediction(predRes.data);
    } catch (error) {
      console.error('Data load failed');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    setInput('');

    try {
      const response = await api.post('/ai/chat', { message: input });
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMsg: Message = {
        role: 'assistant',
        content: 'Sorry, I could not process that. Try asking about growth, risks, or suggestions.',
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const QuickSuggestion = ({ icon: Icon, text, onClick }: { icon: any, text: string, onClick: () => void }) => (
    <button
      onClick={onClick}
      className="flex items-center space-x-3 p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all group"
    >
      <Icon className="w-5 h-5 text-blue-500 group-hover:scale-110" />
      <span className="font-medium">{text}</span>
    </button>
  );

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8 rounded-3xl shadow-2xl">
          <div className="flex items-center mb-6">
            <TrendingUp className="w-8 h-8 mr-3" />
            <h2 className="text-2xl font-bold">Smart Insights</h2>
          </div>
          {insights?.insights?.map((insight: any, index: number) => (
            <div key={index} className={`mb-4 p-4 rounded-2xl ${insight.type === 'success' ? 'bg-green-500/20 border-green-400' :
                insight.type === 'warning' ? 'bg-yellow-500/20 border-yellow-400' :
                  'bg-red-500/20 border-red-400'
              } border-2`}>
              <h3 className="font-semibold text-lg">{insight.title}</h3>
              <p className="text-blue-100">{insight.message}</p>
            </div>
          ))}
          {insights?.alertCount > 0 && (
            <div className="mt-6 p-4 bg-red-500/20 border-2 border-red-400 rounded-2xl">
              <AlertTriangle className="w-6 h-6 inline mr-2 text-red-300" />
              <span className="font-semibold text-lg">
                {insights.alertCount} high priority alerts
              </span>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <Activity className="w-8 h-8 mr-3 text-blue-500" />
            <h2 className="text-2xl font-bold">Prediction</h2>
          </div>
          {prediction && (
            <div className="space-y-3">
              <div className="text-3xl font-bold text-white">
                {prediction.nextMonthGrowth}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${prediction.trend === 'Upward' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {prediction.trend} Trend
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Confidence: {prediction.confidence}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="p-6 bg-white/50 dark:bg-gray-900/50 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Bot className="w-10 h-10 bg-blue-100 text-blue-600 p-3 rounded-2xl mr-4" />
              <div>
                <h2 className="text-2xl font-bold text-white">Smart Business Assistant</h2>
                <p className="text-gray-600 dark:text-gray-400">Ask about growth, risks, suggestions</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (messages.length === 0) {
                  toast.error('No messages to export');
                  return;
                }
                const content = messages.map(m => `${m.role.toUpperCase()} (${m.timestamp}):\n${m.content}\n`).join('\n---\n\n');
                void generateBrandedPDF({
                  title: 'AERA Strategic Chat Export',
                  content: content,
                  filename: `Chat_Export_${Date.now()}`,
                  type: 'ai_chat_transcript'
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-white/60 hover:bg-white/10 transition-all uppercase tracking-widest"
            >
              <Download size={14} />
              Export
            </button>
          </div>


          {/* Quick Suggestions */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <QuickSuggestion
              icon={TrendingUp}
              text="How's growth?"
              onClick={() => setInput('How is my business growth?')}
            />
            <QuickSuggestion
              icon={AlertTriangle}
              text="Show risks"
              onClick={() => setInput('What are my business risks?')}
            />
            <QuickSuggestion
              icon={Activity}
              text="Performance"
              onClick={() => setInput('How is performance?')}
            />
            <QuickSuggestion
              icon={TrendingUp}
              text="Suggestions"
              onClick={() => setInput('Business suggestions?')}
            />
          </div>
        </div>

        {/* Messages */}
        <div className="h-96 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-20">
              <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Ask me anything about your business data</p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md p-4 rounded-2xl shadow-lg ${msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-2 opacity-75 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl shadow-lg max-w-md">
                <LoadingSpinner />
                <p className="text-sm text-gray-500 mt-2">Analyzing...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50">
          <div className="flex space-x-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about your business data..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartChat;

