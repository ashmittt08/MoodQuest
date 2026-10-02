import { ArrowLeft, History, LifeBuoy, MessageCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { CompanionAvatar, MessageBubble, TypingIndicator, type DisplayMessage } from "@/components/chat/ChatParts";
import { ChatComposer, MAX_MESSAGE_LENGTH } from "@/components/chat/ChatComposer";
import { ConversationList } from "@/components/chat/ConversationList";
import { SuggestionChips } from "@/components/chat/SuggestionChips";
import { VoiceReplyToggle } from "@/components/chat/VoiceReplyToggle";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useToast } from "@/contexts/ToastContext";
import { useAsync } from "@/hooks/useAsync";
import { useVoiceReplies } from "@/hooks/useVoiceReplies";
import { getErrorMessage } from "@/lib/api";
import { chatService } from "@/services/chatService";
import type { ConversationDetail } from "@/types";



export function ChatPage() {
  const toast = useToast();
  const voice = useVoiceReplies();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeId = Number(searchParams.get("c")) || null;

  const conversations = useAsync(() => chatService.listConversations(), []);
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [pending, setPending] = useState<DisplayMessage | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [creating, setCreating] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const selectConversation = useCallback(
    (id: number | null, replace = false) => {
      setSearchParams(id ? { c: String(id) } : {}, { replace });
      setHistoryOpen(false);
    },
    [setSearchParams],
  );

  useEffect(() => {
    if (!activeId && conversations.data?.length) selectConversation(conversations.data[0].id, true);
  }, [activeId, conversations.data, selectConversation]);

  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    setDetailError(null);
    try {
      const data = await chatService.getConversation(id);
      setDetail(data);
      setSuggestions(data.suggestions);
    } catch (error) {
      setDetail(null);
      setDetailError(getErrorMessage(error, "Couldn't load this conversation."));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeId && activeId !== detail?.id) void loadDetail(activeId);
  }, [activeId, detail?.id, loadDetail]);

  const messages: DisplayMessage[] = useMemo(() => {
    const persisted = (detail?.messages ?? []).map((m) => ({ ...m, key: `m${m.id}` }));
    return pending ? [...persisted, pending] : persisted;
  }, [detail, pending]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, sending]);

  async function startConversation(): Promise<ConversationDetail | null> {
    setCreating(true);
    try {
      const created = await chatService.createConversation();
      setDetail(created);
      setSuggestions(created.suggestions);
      selectConversation(created.id);
      void conversations.reload();
      return created;
    } catch (error) {
      toast.error(getErrorMessage(error, "Couldn't start a conversation."));
      return null;
    } finally {
      setCreating(false);
    }
  }

  async function send(text: string) {
    if (sending || detailLoading || creating) return;
    const content = text.trim();
    if (!content) {
      setInputError("Type a message first.");
      inputRef.current?.focus();
      return;
    }
    if (content.length > MAX_MESSAGE_LENGTH) {
      setInputError(`Messages can be up to ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }
    setInputError(null);
    setSending(true);
    setInput("");
    setPending({ key: "pending", sender: "user", content, created_at: new Date().toISOString(), pending: true });

    try {
      const conversation = detail ?? (await startConversation());
      if (!conversation) throw new Error("no conversation");
      const reply = await chatService.sendMessage(conversation.id, content);
      setDetail((current) =>
        current && current.id === conversation.id
          ? { ...current, messages: [...current.messages, reply.user_message, reply.assistant_message] }
          : current,
      );
      setSuggestions(reply.suggestions);
      voice.speak(reply.assistant_message.content);
      void conversations.reload();
    } catch (error) {
      setInput(content);
      if (error instanceof Error && error.message === "no conversation") return;
      toast.error(getErrorMessage(error, "Your message wasn't sent. Please try again."));
    } finally {
      setPending(null);
      setSending(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this conversation? This cannot be undone.")) return;
    try {
      await chatService.deleteConversation(id);
      if (id === activeId) {
        setDetail(null);
        selectConversation(null, true);
      }
      await conversations.reload();
      toast.success("Conversation deleted");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  const list = (
    <ConversationList
      conversations={conversations.data}
      loading={conversations.loading}
      error={conversations.error}
      activeId={activeId}
      onSelect={(id) => selectConversation(id)}
      onNew={() => void startConversation()}
      onDelete={(id) => void handleDelete(id)}
      onRetry={conversations.reload}
      creating={creating}
    />
  );

  const noConversations = !conversations.loading && !conversations.error && conversations.data?.length === 0 && !detail;

  return (
    <div className="flex h-[calc(100dvh-5.75rem-env(safe-area-inset-bottom))] gap-6 lg:h-[calc(100dvh-4rem)]">
      <aside className="glass hidden w-72 shrink-0 overflow-y-auto p-4 lg:block">{list}</aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 pb-3 sm:gap-3">
          <button
            onClick={() => navigate("/")}
            aria-label="Go back"
            className="-ml-1.5 rounded-full p-1.5 text-slate-200 hover:bg-white/5 lg:hidden"
          >
            <ArrowLeft className="size-5.5" />
          </button>
          <CompanionAvatar />
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-semibold text-white">AI Companion</h1>
            <p className="flex items-center gap-1.5 text-xs text-emerald-300">
              <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgb(52_211_153)]" aria-hidden />
              Online
            </p>
          </div>
          <IconButton label="Conversation history" onClick={() => setHistoryOpen(true)} className="size-9 sm:size-10 lg:hidden">
            <History className="size-4.5" />
          </IconButton>
          <VoiceReplyToggle
            supported={voice.supported}
            enabled={voice.enabled}
            speaking={voice.speaking}
            onToggle={voice.toggle}
            className="size-9 sm:size-10"
          />
        </header>

        <p className="mb-2 flex items-center gap-1.5 text-[11px] whitespace-nowrap text-slate-500">
          <LifeBuoy className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">A supportive companion, not a therapist.</span>
          <Link to="/emergency" className="font-medium text-rose-300 hover:underline">
            Need urgent help?
          </Link>
        </p>

        <div
          ref={scrollRef}
          className="glass scrollbar-none flex-1 space-y-4 overflow-y-auto p-4 sm:p-5"
          aria-live="polite"
          aria-busy={sending}
        >
          {noConversations ? (
            <EmptyState
              icon={MessageCircle}
              title="Start a conversation with your AI companion."
              message="Share how your day is going, or pick a prompt below."
              action={
                <Button onClick={() => void startConversation()} loading={creating}>
                  Start chatting
                </Button>
              }
            />
          ) : conversations.error && !conversations.data ? (
            <ErrorState message={conversations.error} onRetry={conversations.reload} />
          ) : detailError ? (
            <ErrorState message={detailError} onRetry={() => activeId && void loadDetail(activeId)} />
          ) : detailLoading || (conversations.loading && !detail) ? (
            <LoadingState label="Loading messages…" />
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.key} message={message} />
              ))}
              {sending && <TypingIndicator />}
            </>
          )}
        </div>

        <SuggestionChips suggestions={suggestions} onSend={(text) => void send(text)} disabled={sending} className="mt-3" />

        <ChatComposer
          id="chat-input"
          value={input}
          onChange={(value) => {
            setInput(value);
            if (inputError) setInputError(null);
          }}
          onSend={(text) => void send(text)}
          error={inputError}
          sendDisabled={sending || detailLoading || creating}
          inputRef={inputRef}
          onVoiceStart={voice.cancel}
          className="mt-3 pb-2"
        />
      </section>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Conversations">
        {list}
      </Modal>
    </div>
  );
}
