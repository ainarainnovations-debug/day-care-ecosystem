import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, Send, Search, Phone, Video, MoreHorizontal,
  Plus, Mic, Image, FileText, MapPin, Smile
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import ParentBottomNav from "@/components/parent/ParentBottomNav";
import type { ParentTab } from "@/pages/ParentDashboard";

const conversations = [
  { id: 1, name: "Ms. Rodriguez", provider: "Sunshine Home Daycare", lastMessage: "Emma had a wonderful day today!", time: "2:30 PM", unread: 2, avatar: "🧑‍🏫", online: true },
  { id: 2, name: "Little Explorers", provider: "Little Explorers Center", lastMessage: "Liam's enrollment is confirmed for next week.", time: "Yesterday", unread: 0, avatar: "🏫", online: false },
  { id: 3, name: "Garden Path Care", provider: "Garden Path Childcare", lastMessage: "We have 2 spots opening in February!", time: "Mon", unread: 1, avatar: "🌿", online: true },
];

const messages = [
  { id: 1, sender: "provider", text: "Good morning! Emma arrived safely and is playing with her friends. 🌞", time: "8:15 AM" },
  { id: 2, sender: "provider", text: "Just wanted to let you know she ate all her breakfast — oatmeal with berries!", time: "9:00 AM" },
  { id: 3, sender: "parent", text: "That's great to hear! She loves berries 🫐", time: "9:05 AM" },
  { id: 4, sender: "provider", text: "We're heading outside for playtime now. I'll send photos!", time: "10:30 AM" },
  { id: 5, sender: "provider", text: "📸 Emma playing in the sandbox with two other kids", time: "10:45 AM" },
  { id: 6, sender: "parent", text: "Adorable! Thanks for the update 💕", time: "11:00 AM" },
  { id: 7, sender: "provider", text: "She's napping now. Fell asleep after about 10 minutes. 😴", time: "1:15 PM" },
  { id: 8, sender: "provider", text: "Emma had a wonderful day today! She tried finger painting for the first time and loved it. Ready for pickup anytime!", time: "2:30 PM" },
];

const Messages = () => {
  const [selectedConvo, setSelectedConvo] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showAttachments, setShowAttachments] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const activeConvo = conversations.find((c) => c.id === selectedConvo);

  // Mobile: show either list or chat
  const showList = isMobile ? selectedConvo === null : true;
  const showChat = isMobile ? selectedConvo !== null : true;

  const handleNavTabChange = (tab: ParentTab) => {
    navigate("/parent/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isMobile && <Navbar />}

      {/* Mobile top bar */}
      {isMobile && showList && (
        <div className="sticky top-0 z-30 bg-popover border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/parent/dashboard")} className="p-1">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-heading text-lg font-bold text-foreground">Messages</h1>
          </div>
        </div>
      )}

      <div className={`flex-1 flex ${!isMobile ? "container mx-auto px-4 py-6" : ""}`}>
        <div className={`${!isMobile ? "bg-popover rounded-xl border border-border overflow-hidden" : ""} flex flex-1 ${!isMobile ? "h-[calc(100vh-140px)]" : ""}`}>

          {/* ========== CONVERSATION LIST ========== */}
          {showList && (
            <div className={`flex flex-col ${isMobile ? "w-full pb-20" : "w-80 border-r border-border"}`}>
              {/* Header - desktop only (mobile has top bar) */}
              {!isMobile && (
                <div className="sticky top-0 z-10 bg-popover px-4 py-3 border-b border-border">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-3">Messages</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search conversations" className="pl-9 h-9 rounded-full bg-secondary border-none" />
                  </div>
                </div>
              )}
              {/* Search - mobile */}
              {isMobile && (
                <div className="px-4 py-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search conversations" className="pl-9 h-9 rounded-full bg-secondary border-none" />
                  </div>
                </div>
              )}

              {/* List */}
              <div className="flex-1 overflow-y-auto">
                {conversations.map((convo) => (
                  <button
                    key={convo.id}
                    onClick={() => setSelectedConvo(convo.id)}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 border-b border-border/50 transition-colors ${
                      selectedConvo === convo.id && !isMobile ? "bg-light-coral/20" : "hover:bg-secondary/50 active:bg-secondary"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 bg-light-sage rounded-full flex items-center justify-center text-xl">
                        {convo.avatar}
                      </div>
                      {convo.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-accent rounded-full border-2 border-popover" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-semibold text-foreground text-sm">{convo.name}</span>
                        <span className={`text-xs ${convo.unread > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}>{convo.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                    </div>

                    {/* Unread badge */}
                    {convo.unread > 0 && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 min-w-[20px] h-5 flex items-center justify-center rounded-full">
                        {convo.unread}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ========== CHAT AREA ========== */}
          {showChat && (
            <div className="flex-1 flex flex-col bg-background">
              {/* Chat Header */}
              <div className="sticky top-0 z-10 bg-popover px-3 py-2.5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {isMobile && (
                    <button onClick={() => { setSelectedConvo(null); setShowAttachments(false); }} className="p-1">
                      <ArrowLeft className="w-5 h-5 text-foreground" />
                    </button>
                  )}
                  <div className="relative">
                    <div className="w-9 h-9 bg-light-sage rounded-full flex items-center justify-center text-base">
                      {activeConvo?.avatar || "🧑‍🏫"}
                    </div>
                    {activeConvo?.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-accent rounded-full border-2 border-popover" />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm leading-tight">{activeConvo?.name || "Ms. Rodriguez"}</div>
                    <div className="text-[11px] text-accent">{activeConvo?.online ? "Online" : "Offline"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Video className="w-4 h-4 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Phone className="w-4 h-4 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4 text-muted-foreground" /></Button>
                </div>
              </div>

              {/* Date label */}
              <div className="flex justify-center py-3">
                <span className="text-[11px] text-muted-foreground bg-secondary/80 px-3 py-1 rounded-full">Today</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 space-y-2 pb-2">
                {messages.map((msg) => {
                  const isParent = msg.sender === "parent";
                  return (
                    <div key={msg.id} className={`flex ${isParent ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[78%] ${isParent ? "order-1" : ""}`}>
                        <div
                          className={`rounded-2xl px-3.5 py-2.5 ${
                            isParent
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-card border border-border text-foreground rounded-bl-sm"
                          }`}
                        >
                          <p className="text-[13px] leading-relaxed">{msg.text}</p>
                        </div>
                        <div className={`flex items-center gap-1 mt-0.5 px-1 ${isParent ? "justify-end" : "justify-start"}`}>
                          <span className={`text-[10px] text-muted-foreground`}>{msg.time}</span>
                          {isParent && <span className="text-[10px] text-primary">✓✓</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Attachment Panel */}
              {showAttachments && (
                <div className="bg-popover border-t border-border px-4 py-4">
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { icon: FileText, label: "Document" },
                      { icon: Image, label: "Gallery" },
                      { icon: MapPin, label: "Location" },
                      { icon: Smile, label: "GIF" },
                    ].map((item) => (
                      <button key={item.label} className="flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                          <item.icon className="w-5 h-5 text-foreground" />
                        </div>
                        <span className="text-[10px] text-muted-foreground">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Bar */}
              <div className="bg-popover border-t border-border px-3 py-2.5 pb-safe">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAttachments(!showAttachments)}
                    className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0"
                  >
                    <Plus className={`w-4 h-4 text-foreground transition-transform ${showAttachments ? "rotate-45" : ""}`} />
                  </button>
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Type a message"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="rounded-full bg-secondary border-none pr-10 h-9 text-sm"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Mic className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Send className="w-3.5 h-3.5 text-primary-foreground" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom nav */}
      {isMobile && showList && <ParentBottomNav activeTab="home" onTabChange={handleNavTabChange} />}
    </div>
  );
};

export default Messages;
