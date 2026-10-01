import { ArrowLeft, History, LifeBuoy, MessageCircle, Mic, Phone, SendHorizontal, Video } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { CompanionAvatar, MessageBubble, TypingIndicator, type DisplayMessage } from "@/components/chat/ChatParts";
import { ConversationList } from "@/components/chat/ConversationList";
import { Button } from "@/components/ui/Button";
import { IconButton } from "@/components/ui/IconButton";
import { Modal } from "@/components/ui/Modal";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/States";
import { useToast } from "@/contexts/ToastContext";
import { useAsync } from "@/hooks/useAsync";
import { getErrorMessage } from "@/lib/api";
import { cn } from "@/lib/cn";
import { chatService } from "@/services/chatService";
import type { ConversationDetail } from "@/types";

const MAX_LENGTH = 2000;

/** Suggestions that are better served by opening a feature than by sending text. */
const SUGGESTION_ROUTES: Record<string, string> = {
  "Open emergency help": "/emergency",
  "Try a breathing exercise": "/meditation?tab=breathing",
  "Start box breathing": "/meditation?tab=breathing",
  "Sleep meditation": "/meditation?tab=mindfulness",
  "Play calming music": "/music",
  "Play Lo-Fi Chill": "/music",
  "Play calm piano": "/music",
  "Play Stress Burst": "/games",
  "Play a relaxing game": "/games",
  "Play a fun game": "/games",
  "Play a focus game": "/games",
  "Write in my journal": "/journal",
  "Suggest a comfort movie": "/movies",
};

export function ChatPage() {
  const toast = useToast();
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

  // Open the most recent conversation when none is selected.
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

  // Note: never clear `detail` just because no id is selected — React Router applies
  // setSearchParams in a transition, so a freshly created conversation can render
  // one frame before its ?c= id arrives. Deleting clears it explicitly instead.
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
    if (content.length > MAX_LENGTH) {
      setInputError(`Messages can be up to ${MAX_LENGTH} characters.`);
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
      void conversations.reload();
    } catch (error) {
      setInput(content); // give the text back so nothing is lost
      if (error instanceof Error && error.message === "no conversation") return;
      toast.error(getErrorMessage(error, "Your message wasn't sent. Please try again."));
    } finally {
      setPending(null);
      setSending(false);
    }
  }

  function handleSuggestion(text: string) {
    const route = SUGGESTION_ROUTES[text];
    if (route) navigate(route);
    else void send(text);
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

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  const phase2 = (feature: string) => toast.info(`${feature} will be available in Phase 2.`);

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
          <IconButton label="Voice call (Phase 2)" onClick={() => phase2("Voice calls")} className="size-9 sm:size-10">
            <Phone className="size-4.5" />
          </IconButton>
          <IconButton label="Video call (Phase 2)" onClick={() => phase2("Video calls")} className="size-9 sm:size-10">
            <Video className="size-4.5" />
          </IconButton>
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

        {suggestions.length > 0 && (
          <div className="scrollbar-none -mx-1 mt-3 flex gap-2 overflow-x-auto px-1" aria-label="Suggested prompts">
            {suggestions.map((text) => (
              <button
                key={text}
                onClick={() => handleSuggestion(text)}
                disabled={sending}
                className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-200 transition hover:border-primary-400/40 hover:bg-primary-500/10 disabled:opacity-50"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 flex items-end gap-2 pb-2">
          <IconButton label="Voice input (Phase 2)" onClick={() => phase2("Voice input")} type="button">
            <Mic className="size-4.5" />
          </IconButton>
          <div className="flex-1">
            <label htmlFor="chat-input" className="sr-only">
              Message
            </label>
            <textarea
              id="chat-input"
              ref={inputRef}
              rows={1}
              value={input}
              maxLength={MAX_LENGTH}
              onChange={(e) => {
                setInput(e.target.value);
                if (inputError) setInputError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
              placeholder="Type a message…"
              aria-invalid={!!inputError || undefined}
              className={cn(
                "block max-h-32 min-h-11 w-full resize-none rounded-full border bg-ink-850/80 px-5 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary-400/60 focus:ring-2 focus:ring-primary-500/20",
                inputError ? "border-rose-400/60" : "border-white/10",
              )}
            />
            {inputError && <p className="mt-1 px-3 text-xs text-rose-300">{inputError}</p>}
          </div>
          <IconButton label="Send message" tone="primary" type="submit" disabled={sending || detailLoading || creating} className="size-11">
            <SendHorizontal className="size-5" />
          </IconButton>
        </form>
      </section>

      <Modal open={historyOpen} onClose={() => setHistoryOpen(false)} title="Conversations">
        {list}
      </Modal>
    </div>
  );
}
