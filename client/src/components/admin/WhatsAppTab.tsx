import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  MessageCircle,
  Send,
  Phone,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  ArrowDownCircle,
  ArrowUpCircle,
  Bot,
  Users,
  BarChart3,
} from "lucide-react";
import { PAGE_SIZE } from "./types";
import { Pagination } from "./Pagination";

export function WhatsAppTab() {
  const [page, setPage] = useState(1);
  const [phoneFilter, setPhoneFilter] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [sendText, setSendText] = useState("");
  const [showSendForm, setShowSendForm] = useState(false);

  const { data: stats, refetch: refetchStats } =
    trpc.whatsapp.getStats.useQuery();

  const { data: messagesData, refetch: refetchMessages } =
    trpc.whatsapp.listMessages.useQuery({
      page,
      pageSize: PAGE_SIZE,
      phoneFilter: phoneFilter || undefined,
    });

  const sendMut = trpc.whatsapp.sendMessage.useMutation({
    onSuccess: data => {
      if (data.success) {
        toast.success("Message sent successfully!");
        setSendTo("");
        setSendText("");
        setShowSendForm(false);
        void refetchMessages();
        void refetchStats();
      } else {
        toast.error(data.error || "Failed to send message");
      }
    },
    onError: () => toast.error("Failed to send message"),
  });

  const toggleAutoReply = trpc.whatsapp.updateAutoReply.useMutation({
    onSuccess: data => {
      toast.success(
        `Auto-reply ${data.autoReplyEnabled ? "enabled" : "disabled"}`
      );
      void refetchStats();
    },
    onError: () => toast.error("Failed to update auto-reply setting"),
  });

  const messages = messagesData?.items ?? [];
  const totalPages = messagesData?.totalPages ?? 1;

  // Not configured state
  if (stats && !stats.isConfigured) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <MessageCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold">WhatsApp Integration</h2>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-yellow-800 mb-2">
            WhatsApp API Not Configured
          </h3>
          <p className="text-sm text-yellow-700 mb-4">
            The WhatsApp Business Cloud API is not yet configured. Once set up,
            you'll be able to receive messages, send auto-replies, and manage
            conversations from this panel.
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <h3 className="font-medium mb-3">Setup Instructions</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              Create a{" "}
              <a
                href="https://business.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
              >
                Meta Business Account <ExternalLink className="w-3 h-3" />
              </a>
            </li>
            <li>
              Go to{" "}
              <a
                href="https://developers.facebook.com/apps/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline inline-flex items-center gap-0.5"
              >
                Meta Developers <ExternalLink className="w-3 h-3" />
              </a>{" "}
              and create a new app with WhatsApp integration
            </li>
            <li>
              Navigate to WhatsApp {">"} API Setup and note your{" "}
              <strong>Phone Number ID</strong> and{" "}
              <strong>Permanent Access Token</strong>
            </li>
            <li>
              Add environment variables in Vercel:
              <div className="mt-1 bg-muted rounded p-2 font-mono text-xs">
                WHATSAPP_API_TOKEN=your_permanent_token
                <br />
                WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
                <br />
                WHATSAPP_VERIFY_TOKEN=wiro4x4_webhook_verify
              </div>
            </li>
            <li>
              Configure the webhook URL in Meta Developers:
              <div className="mt-1 bg-muted rounded p-2 font-mono text-xs">
                https://www.wiro4x4indochina.com/api/whatsapp/webhook
              </div>
            </li>
            <li>
              Subscribe to <strong>messages</strong> webhook field
            </li>
            <li>Redeploy the application</li>
          </ol>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-green-600" />
          <h2 className="text-lg font-semibold">WhatsApp Messages</h2>
        </div>
        <button
          onClick={() => setShowSendForm(!showSendForm)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
        >
          <Send className="w-4 h-4" />
          Send Message
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Today</span>
            </div>
            <p className="text-xl font-bold">{stats.messagesToday}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Bot className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Auto-Replies Today
              </span>
            </div>
            <p className="text-xl font-bold">{stats.autoRepliesToday}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Unique Contacts
              </span>
            </div>
            <p className="text-xl font-bold">{stats.uniqueContacts}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <MessageCircle className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Total Messages
              </span>
            </div>
            <p className="text-xl font-bold">{stats.totalMessages}</p>
          </div>
        </div>
      )}

      {/* Auto-Reply Toggle */}
      <div className="flex items-center justify-between bg-muted/30 border border-border rounded-lg p-3 mb-4">
        <div>
          <p className="text-sm font-medium">Auto-Reply</p>
          <p className="text-xs text-muted-foreground">
            Automatically respond to incoming WhatsApp messages with keyword
            detection
          </p>
        </div>
        <button
          onClick={() =>
            toggleAutoReply.mutate({
              enabled: !(stats?.autoReplyEnabled ?? true),
            })
          }
          disabled={toggleAutoReply.isPending}
          className="flex items-center gap-1.5 text-sm"
        >
          {stats?.autoReplyEnabled ? (
            <>
              <ToggleRight className="w-8 h-8 text-green-600" />
              <span className="text-green-600 font-medium">On</span>
            </>
          ) : (
            <>
              <ToggleLeft className="w-8 h-8 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">Off</span>
            </>
          )}
        </button>
      </div>

      {/* Send Message Form */}
      {showSendForm && (
        <div className="bg-card border border-border rounded-lg p-4 mb-4">
          <h3 className="font-medium mb-3">Send WhatsApp Message</h3>
          <div className="grid gap-3">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Phone Number (with country code, e.g. 972501234567)
              </label>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={sendTo}
                  onChange={e => setSendTo(e.target.value)}
                  placeholder="972501234567"
                  className="flex-1 px-3 py-2 border border-border rounded-lg text-sm bg-background"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Message
              </label>
              <textarea
                value={sendText}
                onChange={e => setSendText(e.target.value)}
                rows={3}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSendForm(false)}
                className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!sendTo.trim() || !sendText.trim()) {
                    toast.error("Please fill in both phone number and message");
                    return;
                  }
                  sendMut.mutate({ to: sendTo.trim(), text: sendText.trim() });
                }}
                disabled={sendMut.isPending}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {sendMut.isPending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Phone Filter */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={phoneFilter}
          onChange={e => {
            setPhoneFilter(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by phone number..."
          className="flex-1 max-w-xs px-3 py-2 border border-border rounded-lg text-sm bg-background"
        />
        {phoneFilter && (
          <button
            onClick={() => {
              setPhoneFilter("");
              setPage(1);
            }}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg"
          >
            Clear
          </button>
        )}
      </div>

      {/* Message List (Chat-style) */}
      <div className="space-y-2 mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No messages yet</p>
            <p className="text-xs mt-1">
              Messages will appear here when customers contact you via WhatsApp
            </p>
          </div>
        ) : (
          messages.map(msg => {
            const isIncoming = msg.direction === "incoming";
            const time = new Date(msg.createdAt).toLocaleString();
            return (
              <div
                key={msg.id}
                className={`flex ${isIncoming ? "justify-start" : "justify-end"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    isIncoming
                      ? "bg-muted/50 border border-border"
                      : msg.isAutoReply
                        ? "bg-blue-50 border border-blue-200"
                        : "bg-green-50 border border-green-200"
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1">
                    {isIncoming ? (
                      <ArrowDownCircle className="w-3.5 h-3.5 text-blue-500" />
                    ) : (
                      <ArrowUpCircle className="w-3.5 h-3.5 text-green-500" />
                    )}
                    <span className="text-xs font-medium">
                      {isIncoming
                        ? msg.customerName || msg.phoneNumber
                        : "WIRO 4x4"}
                    </span>
                    {msg.isAutoReply === 1 && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                        Auto-Reply
                      </span>
                    )}
                    <span className="text-[10px] text-muted-foreground ml-auto">
                      {msg.status}
                    </span>
                  </div>
                  {/* Message text */}
                  <p className="text-sm whitespace-pre-wrap">
                    {msg.messageText}
                  </p>
                  {/* Footer */}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">
                      {isIncoming ? msg.phoneNumber : `To: ${msg.phoneNumber}`}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {time}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          total={messagesData?.total ?? 0}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
