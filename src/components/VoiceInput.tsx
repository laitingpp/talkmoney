import { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, Square, RotateCcw, Check, Keyboard } from 'lucide-react';
import { getCategoryByKeyword } from '../data/categories';

interface ParsedExpense {
  amount: number;
  description: string;
  category: string;
}

interface VoiceInputProps {
  onConfirm: (expense: ParsedExpense) => void;
}

// 检测浏览器是否支持语音识别
const isSpeechRecognitionSupported = () => {
  const win = window as typeof window & {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  };
  return !!(win.SpeechRecognition || win.webkitSpeechRecognition);
};

// 检测是否是 iOS 设备
const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

// 检测是否是安全的上下文（HTTPS 或 localhost）
const isSecureContext = () => {
  return window.isSecureContext;
};

export default function VoiceInput({ onConfirm }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [parsedExpense, setParsedExpense] = useState<ParsedExpense | null>(null);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [textInput, setTextInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // 解析语音文本
  const parseExpense = useCallback((text: string): ParsedExpense => {
    const amountMatch = text.match(/(\d+(?:\.\d+)?)\s*(块|元|块钱)?/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : 0;
    const category = getCategoryByKeyword(text);
    
    return {
      amount,
      description: text,
      category,
    };
  }, []);

  // 处理文本输入
  const handleTextSubmit = useCallback(() => {
    if (textInput.trim()) {
      setTranscript(textInput.trim());
      setParsedExpense(parseExpense(textInput.trim()));
    }
  }, [textInput, parseExpense]);

  // 开始录音
  const startRecording = useCallback(() => {
    setError(null);
    
    // 检查是否是安全上下文（iOS 需要 HTTPS）
    if (isIOS() && !isSecureContext()) {
      setError('iOS 需要使用 HTTPS 才能使用语音功能。请尝试：1.使用文字输入 2.部署到支持 HTTPS 的服务器');
      return;
    }
    
    if (!isSpeechRecognitionSupported()) {
      setError('您的浏览器不支持语音识别，请使用 Chrome、Edge 或 Safari');
      return;
    }

    const win = window as typeof window & {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    };
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      setError('语音识别初始化失败');
      return;
    }

    const newRecognition = new SpeechRecognitionClass();
    
    newRecognition.lang = 'zh-CN';
    // iOS Safari 不支持 continuous: true，需要设为 false
    newRecognition.continuous = false;
    newRecognition.interimResults = true;
    newRecognition.maxAlternatives = 1;

    newRecognition.onstart = () => {
      setIsRecording(true);
      setTranscript('');
      setInterimTranscript('');
      setParsedExpense(null);
    };

    newRecognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interim += transcript;
        }
      }

      if (interim) {
        setInterimTranscript(interim);
      }
      
      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
        setInterimTranscript('');
      }
    };

    newRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('语音识别错误:', event.error);
      if (event.error === 'not-allowed') {
        setError('请允许使用麦克风权限');
      } else if (event.error === 'no-speech') {
        setError('没有检测到语音，请重试');
      } else if (event.error === 'network') {
        setError('网络错误，请检查网络连接');
      } else {
        setError(`识别出错: ${event.error}`);
      }
      setIsRecording(false);
    };

    newRecognition.onend = () => {
      setIsRecording(false);
      setTranscript(current => {
        const finalText = current.trim() || interimTranscript.trim();
        if (finalText) {
          setParsedExpense(parseExpense(finalText));
          return finalText;
        }
        return current;
      });
    };

    try {
      newRecognition.start();
      recognitionRef.current = newRecognition;
    } catch (err) {
      console.error('启动语音识别失败:', err);
      setError('启动语音识别失败，请重试');
    }
  }, [parseExpense, interimTranscript]);

  // 停止录音
  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  }, []);

  // 清理
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // 重置
  const handleReset = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setParsedExpense(null);
    setTextInput('');
    setError(null);
  }, []);

  // 确认保存
  const handleConfirm = useCallback(() => {
    if (parsedExpense && parsedExpense.amount > 0) {
      onConfirm(parsedExpense);
      setTranscript('');
      setInterimTranscript('');
      setParsedExpense(null);
      setTextInput('');
    }
  }, [parsedExpense, onConfirm]);

  // 切换输入模式
  const toggleInputMode = useCallback(() => {
    if (isRecording) {
      stopRecording();
    }
    setInputMode(prev => prev === 'voice' ? 'text' : 'voice');
    setTranscript('');
    setInterimTranscript('');
    setParsedExpense(null);
    setTextInput('');
    setError(null);
  }, [isRecording, stopRecording]);

  // 获取分类名称
  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      food: '餐饮',
      transport: '交通',
      shopping: '购物',
      entertainment: '娱乐',
      housing: '居住',
      medical: '医疗',
      education: '学习',
      other: '其他'
    };
    return names[category] || '其他';
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6">
      {/* 模式切换按钮 */}
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleInputMode}
          className="flex items-center gap-1 text-white/60 text-xs hover:text-white transition-colors"
        >
          {inputMode === 'voice' ? (
            <>
              <Keyboard className="w-3 h-3" />
              切换文字输入
            </>
          ) : (
            <>
              <Mic className="w-3 h-3" />
              切换语音输入
            </>
          )}
        </button>
      </div>

      {inputMode === 'voice' ? (
        <>
          {/* 录音按钮 */}
          <div className="flex justify-center mb-6">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`
                relative w-24 h-24 rounded-full flex items-center justify-center
                transition-all duration-300 transform hover:scale-105
                ${isRecording 
                  ? 'bg-red-500 shadow-lg shadow-red-500/50' 
                  : 'bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg shadow-blue-500/50'
                }
              `}
            >
              {isRecording && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-500 recording-pulse" />
                  <span className="absolute inset-0 rounded-full bg-red-500 recording-pulse" style={{ animationDelay: '0.5s' }} />
                </>
              )}
              
              <div className="relative z-10">
                {isRecording ? (
                  <Square className="w-8 h-8 text-white fill-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </div>
            </button>
          </div>

          {/* 提示文字 */}
          <p className="text-center text-white/80 text-sm mb-4">
            {isRecording 
              ? '正在聆听... (说完自动停止)' 
              : '点击麦克风开始说话'}
          </p>

          {/* 实时显示识别中的文字 */}
          {isRecording && (transcript || interimTranscript) && (
            <div className="bg-white/10 rounded-xl p-3 mb-4 text-center">
              <p className="text-white text-lg">
                {transcript}
                <span className="text-white/50">{interimTranscript}</span>
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* 文字输入 */}
          <div className="mb-4">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="输入消费内容，如：午饭 35 块"
              className="w-full bg-white/20 text-white placeholder-white/50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-white/30"
              onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
            />
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim()}
              className="w-full mt-3 bg-gradient-to-r from-cyan-400 to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-all"
            >
              解析
            </button>
          </div>
        </>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-500/20 rounded-xl p-3 mb-4">
          <p className="text-red-200 text-sm text-center">{error}</p>
        </div>
      )}

      {/* 识别结果 */}
      {!isRecording && transcript && (
        <div className="slide-up">
          <div className="bg-white/20 rounded-2xl p-4 mb-4">
            <p className="text-white/60 text-xs mb-1">识别内容</p>
            <p className="text-white text-lg">{transcript}</p>
          </div>

          {parsedExpense && parsedExpense.amount > 0 && (
            <div className="bg-white/20 rounded-2xl p-4 mb-4">
              <p className="text-white/60 text-xs mb-2">解析结果</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-white">
                    ¥{parsedExpense.amount.toFixed(2)}
                  </p>
                  <p className="text-white/80 text-sm mt-1">
                    分类: {getCategoryName(parsedExpense.category)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {parsedExpense && parsedExpense.amount === 0 && (
            <div className="bg-yellow-500/20 rounded-2xl p-4 mb-4">
              <p className="text-yellow-200 text-sm">
                未能识别金额，请尝试说："午饭 35 块"、"打车回家 28 元"
              </p>
            </div>
          )}

          {/* 操作按钮 */}
          {parsedExpense && parsedExpense.amount > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                重说
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                确认
              </button>
            </div>
          )}
        </div>
      )}

      {/* 使用提示 */}
      {!transcript && !isRecording && inputMode === 'voice' && !error && (
        <div className="bg-white/5 rounded-2xl p-4">
          <p className="text-white/60 text-xs mb-2">试试这样说：</p>
          <div className="flex flex-wrap gap-2">
            {['午饭 35 块', '打车回家 28 元', '买杯奶茶 18', '超市买菜 156'].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setTranscript(example);
                  setParsedExpense(parseExpense(example));
                }}
                className="bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
