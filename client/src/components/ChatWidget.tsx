import { useEffect, useState } from "react";
import { Crisp } from "crisp-sdk-web";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * ChatWidget Component
 * 
 * Integrates Crisp live chat widget for real-time customer support.
 * 
 * Features:
 * - Floating chat button in bottom-right corner
 * - Offline message capture when team is unavailable
 * - Automatic email notifications for new messages
 * - Non-aggressive, subtle appearance
 * - Mobile responsive
 * - Positioned to avoid conflicts with Back to Top button
 * - Demo mode for testing widget position before Crisp setup
 * 
 * Setup Instructions:
 * 1. Create a Crisp account at https://app.crisp.chat
 * 2. Get your Website ID from Settings > Workspace Settings > Setup Instructions
 * 3. Replace the CRISP_WEBSITE_ID below with your actual ID
 * 4. Set DEMO_MODE to false to use real Crisp widget
 * 5. See CRISP_SETUP_GUIDE.md for detailed configuration instructions
 */
export function ChatWidget() {
  // ⚠️ DEMO MODE: Set to false once you have your Crisp Website ID
  const DEMO_MODE = true;
  
  // ⚠️ IMPORTANT: Replace with your actual Crisp Website ID
  // Get it from: Crisp Dashboard > Settings > Workspace Settings > Setup Instructions
  const CRISP_WEBSITE_ID = "REPLACE_WITH_YOUR_CRISP_WEBSITE_ID";
  
  const [isOpen, setIsOpen] = useState(false);
  const [demoMessages, setDemoMessages] = useState([
    { role: "bot", text: "Welcome to 3B Solution! 👋", time: "Just now" },
    { role: "bot", text: "We specialize in premium real estate investments across Philippines, Maldives, Europe, USA, and Caribbean.", time: "Just now" },
    { role: "bot", text: "How can we help you today?", time: "Just now" },
  ]);

  useEffect(() => {
    // If demo mode is enabled, don't initialize Crisp
    if (DEMO_MODE) {
      console.log(
        "[Chat Widget] Running in DEMO MODE\n" +
        "This is a visual placeholder to show widget position.\n" +
        "To activate real Crisp chat:\n" +
        "1. Create a Crisp account at https://app.crisp.chat\n" +
        "2. Get your Website ID from Settings > Setup Instructions\n" +
        "3. Update CRISP_WEBSITE_ID in client/src/components/ChatWidget.tsx\n" +
        "4. Set DEMO_MODE = false\n" +
        "5. See CRISP_SETUP_GUIDE.md for detailed instructions"
      );
      return;
    }
    
    // Only initialize if ID is configured
    if (CRISP_WEBSITE_ID && CRISP_WEBSITE_ID !== "REPLACE_WITH_YOUR_CRISP_WEBSITE_ID") {
      try {
        // Initialize Crisp
        Crisp.configure(CRISP_WEBSITE_ID);
        
        // Configure for subtle, non-aggressive appearance
        // The chat button will appear in bottom-right, but won't auto-open
        
        // Set brand color to match secondary color (optional - can also be set in Crisp dashboard)
        // Crisp.setColorTheme("orange"); // Matches your #FF8C00 secondary color
        
        // Track chat interactions for analytics
        Crisp.chat.onChatOpened(() => {
          console.log("[Crisp] Chat opened by visitor");
        });
        
        Crisp.chat.onChatClosed(() => {
          console.log("[Crisp] Chat closed by visitor");
        });
        
        // Optional: Set user information if available (e.g., from auth context)
        // Crisp.user.setEmail("visitor@example.com");
        // Crisp.user.setNickname("John Doe");
        
        console.log("[Crisp] Live chat widget initialized successfully");
      } catch (error) {
        console.error("[Crisp] Failed to initialize chat widget:", error);
      }
    } else {
      console.warn(
        "[Crisp] Website ID not configured. Live chat is disabled.\n" +
        "To enable live chat:\n" +
        "1. Create a Crisp account at https://app.crisp.chat\n" +
        "2. Get your Website ID from Settings > Setup Instructions\n" +
        "3. Update CRISP_WEBSITE_ID in client/src/components/ChatWidget.tsx\n" +
        "4. See CRISP_SETUP_GUIDE.md for detailed instructions"
      );
    }
    
    // Cleanup function
    return () => {
      // Crisp persists across page navigation in SPAs
      // No cleanup needed to maintain chat state between pages
    };
  }, [DEMO_MODE, CRISP_WEBSITE_ID]);

  // If not in demo mode, render nothing (Crisp injects its own DOM elements)
  if (!DEMO_MODE) {
    return null;
  }

  // Demo mode: Render visual placeholder
  // Desktop: Chat button at bottom-6, BackToTop at bottom-24 (above chat)
  // Mobile: Chat button stacked vertically with other buttons
  return (
    <>
      {/* Demo Chat Button - Stacked vertically on mobile, at bottom on desktop */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-[13rem] md:bottom-6 right-6 md:right-8 z-40 md:z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF8C00] text-white shadow-lg transition-all hover:scale-110 hover:shadow-xl"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </button>

      {/* Demo Chat Window - Centered on mobile, right-aligned on desktop */}
      {isOpen && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-50 flex h-[500px] w-[calc(100vw-2rem)] max-w-[350px] md:w-[350px] flex-col rounded-lg bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-lg bg-[#FF8C00] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <div className="font-semibold">3B Solution</div>
                <div className="text-xs opacity-90">Demo Mode - Not Connected</div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {demoMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === "user"
                      ? "bg-[#FF8C00] text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="text-sm">{msg.text}</div>
                  <div
                    className={`mt-1 text-xs ${
                      msg.role === "user" ? "text-white/70" : "text-gray-500"
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Demo Notice */}
            <div className="rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 p-4 text-center">
              <div className="mb-2 text-sm font-semibold text-orange-900">
                🎨 Demo Mode Active
              </div>
              <div className="text-xs text-orange-700">
                This is a visual preview. To activate real live chat:
              </div>
              <div className="mt-2 text-xs text-orange-600">
                1. Create Crisp account<br />
                2. Get Website ID<br />
                3. Add to ChatWidget.tsx<br />
                4. Set DEMO_MODE = false
              </div>
              <a
                href="https://app.crisp.chat/initiate/signup/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block rounded bg-[#FF8C00] px-4 py-2 text-xs font-semibold text-white hover:bg-[#E67E00]"
              >
                Create Crisp Account →
              </a>
            </div>
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type your message... (demo only)"
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#FF8C00] focus:outline-none focus:ring-1 focus:ring-[#FF8C00]"
                disabled
              />
              <Button
                size="icon"
                className="bg-[#FF8C00] hover:bg-[#E67E00]"
                disabled
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-2 text-center text-xs text-gray-500">
              Demo mode - messages won't be sent
            </div>
          </div>
        </div>
      )}
    </>
  );
}
