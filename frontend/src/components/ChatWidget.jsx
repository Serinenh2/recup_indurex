import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Sparkles, ChevronDown, Bot, User } from 'lucide-react'
import api from '../api'
import clsx from 'clsx'

const SUGGESTIONS = [
  'Quels agréments expirent bientôt ?',
  'Y a-t-il des BSD en retard ?',
  'Rechercher : huile moteur',
  'Analyser les stocks',
]

function renderMarkdown(text) {
  if (!text) return ''
  let html = text
    .replace(/```[\s\S]*?```/g, m => `<pre class="bg-slate-100 dark:bg-[#0D1B0A] rounded-lg p-2 text-xs overflow-x-auto my-1"><code>${m.slice(3, -3)}</code></pre>`)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-[#0D1B0A] px-1 py-0.5 rounded text-xs">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold mt-2 mb-1 text-slate-900 dark:text-white">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold mt-2 mb-1 text-slate-900 dark:text-white">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold mt-2 mb-1">$1</h3>')
    .replace(/^---$/gm, '<hr class="border-[#E2E8F0] dark:border-[#2B3D1E] my-2" />')
    .replace(/^- (.+)$/gm, '<li class="ml-4 text-sm list-disc">$1</li>')
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, m => `<ul class="my-1">${m}</ul>`)
    .replace(/\n\n/g, '<br/>')
    .replace(/\n/g, ' ')
  return html
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState(SUGGESTIONS)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, scrollToBottom])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200)
      api.get('/ai/conversations/suggestions/').then(res => {
        if (res.data?.suggestions?.length) setSuggestions(res.data.suggestions)
      }).catch(() => {})
    }
  }, [open])

  const sendMessage = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return

    setInput('')
    setShowSuggestions(false)
    setMessages(prev => [...prev, { role: 'USER', message: msg }])
    setLoading(true)

    try {
      let convId = conversationId

      if (!convId) {
        const convRes = await api.post('/ai/conversations/', {
          contexte: 'GENERAL',
          titre: msg.slice(0, 80),
        })
        convId = convRes.data.id
        setConversationId(convId)
      }

      const res = await api.post(`/ai/conversations/${convId}/envoyer_message/`, {
        message: msg,
      })

      setMessages(prev => [...prev, {
        role: 'ASSISTANT',
        message: res.data.reponse,
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'ASSISTANT',
        message: "Désolé, une erreur s'est produite. Vérifiez que le serveur est démarré.",
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const resetChat = () => {
    setConversationId(null)
    setMessages([])
    setShowSuggestions(true)
    setInput('')
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300',
          'hover:scale-105 active:scale-95',
          open
            ? 'bg-slate-700 hover:bg-slate-600 rotate-0'
            : 'bg-gradient-to-br from-primary-500 to-primary-700 hover:from-primary-600 hover:to-primary-800'
        )}
      >
        {open
          ? <X className="w-5 h-5 text-white" />
          : <MessageCircle className="w-5 h-5 text-white" />
        }
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-120px)] bg-white dark:bg-[#16240D] rounded-2xl shadow-2xl border border-[#E2E8F0] dark:border-[#2B3D1E] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-bold text-sm">Assistant IA</h3>
              <p className="text-white/70 text-xs">RECUP-DZ</p>
            </div>
            <button onClick={resetChat}
              className="text-white/70 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Nouvelle conversation">
              Nouveau
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-3">
                  <Bot className="w-7 h-7 text-primary-500" />
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Assistant Réglementaire</p>
                <p className="text-xs text-slate-400 mb-4">
                  Posez-moi des questions sur les déchets, la nomenclature, les BSD, les agréments...
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={clsx(
                'flex gap-2',
                msg.role === 'USER' ? 'justify-end' : 'justify-start'
              )}>
                {msg.role === 'ASSISTANT' && (
                  <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-primary-600" />
                  </div>
                )}
                <div className={clsx(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'USER'
                    ? 'bg-primary-600 text-white rounded-br-md'
                    : 'bg-[#F1F5F9] dark:bg-[#1A2E10] text-slate-800 dark:text-slate-200 rounded-bl-md'
                )}>
                  {msg.role === 'ASSISTANT' ? (
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none [&_strong]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-bold [&_li]:list-disc [&_li]:ml-4 [&_ul]:my-1 [&_pre]:bg-slate-100 dark:[&_pre]:bg-[#0D1B0A] [&_pre]:rounded-lg [&_pre]:p-2 [&_pre]:text-xs [&_code]:bg-slate-100 dark:[&_code]:bg-[#0D1B0A] [&_code]:px-1 [&_code]:rounded"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.message) }}
                    />
                  ) : (
                    <p>{msg.message}</p>
                  )}
                </div>
                {msg.role === 'USER' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-[#2B3D1E] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3.5 h-3.5 text-primary-600" />
                </div>
                <div className="bg-[#F1F5F9] dark:bg-[#1A2E10] rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {showSuggestions && messages.length === 0 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#E2E8F0] dark:border-[#2B3D1E] text-slate-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-700 dark:hover:text-primary-300 hover:border-primary-300 transition-colors">
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-[#E2E8F0] dark:border-[#2B3D1E] flex-shrink-0">
            <div className="flex items-end gap-2 bg-[#F1F5F9] dark:bg-[#1A2E10] rounded-xl px-3 py-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Votre message..."
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none resize-none max-h-20"
                style={{ minHeight: '20px' }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className={clsx(
                  'p-2 rounded-lg transition-all flex-shrink-0',
                  input.trim() && !loading
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                )}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
