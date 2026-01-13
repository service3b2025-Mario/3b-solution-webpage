/**
 * WhatsApp Click-to-Chat Widget
 * 
 * Displays team WhatsApp contacts with click tracking
 * Shows on Contact, Team, About, and Property Detail pages
 */

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, X, Phone, ChevronUp, ChevronDown } from "lucide-react";

interface WhatsAppAccount {
  id: number;
  name: string;
  role: string;
  title?: string;
  phoneNumber: string;
  countryCode: string;
  avatarUrl?: string;
  defaultMessage: string;
}

interface WhatsAppWidgetProps {
  page: "contact" | "team" | "about" | "property" | string;
  propertyId?: number;
  propertyName?: string;
  variant?: "floating" | "inline" | "card";
  className?: string;
}

export function WhatsAppWidget({ 
  page, 
  propertyId, 
  propertyName,
  variant = "card",
  className = "" 
}: WhatsAppWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);

  // Fetch active accounts for this page
  const { data: accounts, isLoading } = trpc.whatsapp.getActiveAccounts.useQuery({ page });
  
  // Track click mutation
  const trackClickMutation = trpc.whatsapp.trackClick.useMutation();

  // Generate WhatsApp link
  const getWhatsAppLink = (account: WhatsAppAccount) => {
    const phone = `${account.countryCode}${account.phoneNumber}`.replace(/[^0-9+]/g, '').replace('+', '');
    
    // Customize message based on context
    let message = account.defaultMessage;
    if (propertyName) {
      message = `Hi! I'm interested in the property "${propertyName}". Can you provide more information?`;
    }
    
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  // Handle click with tracking
  const handleClick = (account: WhatsAppAccount) => {
    // Track the click
    trackClickMutation.mutate({
      accountId: account.id,
      pagePath: window.location.pathname,
      pageTitle: document.title,
      propertyId: propertyId,
      visitorId: getVisitorId(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      utmSource: getUrlParam('utm_source'),
      utmMedium: getUrlParam('utm_medium'),
      utmCampaign: getUrlParam('utm_campaign'),
    });

    // Open WhatsApp
    window.open(getWhatsAppLink(account), '_blank');
  };

  // Get or create visitor ID
  const getVisitorId = () => {
    let visitorId = localStorage.getItem('3b_visitor_id');
    if (!visitorId) {
      visitorId = `v_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('3b_visitor_id', visitorId);
    }
    return visitorId;
  };

  // Get URL parameter
  const getUrlParam = (param: string) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) || undefined;
  };

  if (isLoading || !accounts || accounts.length === 0) {
    return null;
  }

  // Floating variant (bottom-right corner)
  if (variant === "floating") {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        {/* Expanded panel */}
        {!isMinimized && (
          <Card className="mb-4 w-80 shadow-2xl animate-in slide-in-from-bottom-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Chat with us</h3>
                    <p className="text-xs text-muted-foreground">We typically reply instantly</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(true)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {accounts.map((account: WhatsAppAccount) => (
                  <button
                    key={account.id}
                    onClick={() => handleClick(account)}
                    className="w-full p-3 rounded-lg border hover:bg-green-50 hover:border-green-200 transition-colors flex items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      {account.avatarUrl ? (
                        <img 
                          src={account.avatarUrl} 
                          alt={account.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-green-600 font-semibold">
                          {account.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{account.name}</p>
                      <p className="text-xs text-muted-foreground">{account.role}</p>
                    </div>
                    <MessageCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Floating button */}
        <Button
          onClick={() => setIsMinimized(!isMinimized)}
          className="w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg"
          size="icon"
        >
          {isMinimized ? (
            <MessageCircle className="w-6 h-6" />
          ) : (
            <X className="w-6 h-6" />
          )}
        </Button>
      </div>
    );
  }

  // Inline variant (embedded in page)
  if (variant === "inline") {
    return (
      <div className={`flex flex-wrap gap-3 ${className}`}>
        {accounts.map((account: WhatsAppAccount) => (
          <Button
            key={account.id}
            onClick={() => handleClick(account)}
            variant="outline"
            className="bg-green-50 border-green-200 hover:bg-green-100 hover:border-green-300"
          >
            <MessageCircle className="w-4 h-4 mr-2 text-green-600" />
            <span className="mr-2">{account.name}</span>
            <span className="text-xs text-muted-foreground">({account.role})</span>
          </Button>
        ))}
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {/* Header */}
        <div 
          className="bg-green-500 text-white p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-6 h-6" />
              <div>
                <h3 className="font-semibold">Contact via WhatsApp</h3>
                <p className="text-sm text-green-100">
                  {accounts.length} team member{accounts.length > 1 ? 's' : ''} available
                </p>
              </div>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>

        {/* Team members */}
        {isExpanded && (
          <div className="p-4 space-y-3">
            {accounts.map((account: WhatsAppAccount) => (
              <div
                key={account.id}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {account.avatarUrl ? (
                    <img 
                      src={account.avatarUrl} 
                      alt={account.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-green-600 font-bold text-lg">
                      {account.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold">{account.name}</p>
                  <p className="text-sm text-muted-foreground">{account.role}</p>
                  {account.title && (
                    <p className="text-xs text-muted-foreground">{account.title}</p>
                  )}
                </div>
                <Button
                  onClick={() => handleClick(account)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Quick contact (when collapsed) */}
        {!isExpanded && accounts.length > 0 && (
          <div className="p-4">
            <Button
              onClick={() => handleClick(accounts[0])}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat with {accounts[0].name}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Simple WhatsApp button for quick integration
export function WhatsAppButton({ 
  account,
  propertyId,
  propertyName,
  size = "default",
  className = ""
}: { 
  account: WhatsAppAccount;
  propertyId?: number;
  propertyName?: string;
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const trackClickMutation = trpc.whatsapp.trackClick.useMutation();

  const getWhatsAppLink = () => {
    const phone = `${account.countryCode}${account.phoneNumber}`.replace(/[^0-9+]/g, '').replace('+', '');
    let message = account.defaultMessage;
    if (propertyName) {
      message = `Hi! I'm interested in the property "${propertyName}". Can you provide more information?`;
    }
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  const handleClick = () => {
    trackClickMutation.mutate({
      accountId: account.id,
      pagePath: window.location.pathname,
      pageTitle: document.title,
      propertyId: propertyId,
    });
    window.open(getWhatsAppLink(), '_blank');
  };

  return (
    <Button
      onClick={handleClick}
      className={`bg-green-500 hover:bg-green-600 ${className}`}
      size={size}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      WhatsApp
    </Button>
  );
}

export default WhatsAppWidget;
