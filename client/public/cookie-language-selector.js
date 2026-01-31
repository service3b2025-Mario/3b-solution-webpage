/**
 * Cookie Consent Language Selector
 * This file adds a language selector (EN/DE/中文) to the Silktide cookie consent banner
 * Place this file in: client/public/cookie-language-selector.js
 */

(function() {
  'use strict';
  
  // Multi-language translations
  const cookieTranslations = {
    en: {
      promptDescription: '<p>We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept all", you consent to our use of cookies. <a href="/legal/cookie-policy?lang=en">Cookie Policy</a></p>',
      acceptAll: 'Accept all',
      rejectNonEssential: 'Reject non-essential',
      managePreferences: 'Manage preferences',
      preferencesTitle: 'Cookie Preferences',
      preferencesDescription: '<p>Choose which types of cookies you want to accept. You can change your preferences at any time.</p>',
      savePreferences: 'Save preferences',
      essential: 'Essential',
      essentialDesc: 'These cookies are necessary for the website to function and cannot be switched off.',
      analytics: 'Analytics',
      analyticsDesc: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      marketing: 'Marketing',
      marketingDesc: 'These cookies are used to deliver personalized advertisements and measure the effectiveness of our marketing campaigns.'
    },
    de: {
      promptDescription: '<p>Wir verwenden Cookies, um Ihr Browsererlebnis zu verbessern und unseren Datenverkehr zu analysieren. Durch Klicken auf "Alle akzeptieren" stimmen Sie der Verwendung von Cookies zu. <a href="/legal/cookie-policy?lang=en">Cookie-Richtlinie</a></p>',
      acceptAll: 'Alle akzeptieren',
      rejectNonEssential: 'Nicht notwendige ablehnen',
      managePreferences: 'Einstellungen verwalten',
      preferencesTitle: 'Cookie-Einstellungen',
      preferencesDescription: '<p>Wählen Sie, welche Arten von Cookies Sie akzeptieren möchten. Sie können Ihre Einstellungen jederzeit ändern.</p>',
      savePreferences: 'Einstellungen speichern',
      essential: 'Notwendig',
      essentialDesc: 'Diese Cookies sind für die Funktion der Website erforderlich und können nicht deaktiviert werden.',
      analytics: 'Analytik',
      analyticsDesc: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren.',
      marketing: 'Marketing',
      marketingDesc: 'Diese Cookies werden verwendet, um personalisierte Werbung zu liefern.'
    },
    zh: {
      promptDescription: '<p>我们使用Cookie来增强您的浏览体验并分析我们的流量。点击"全部接受"即表示您同意我们使用Cookie。<a href="/legal/cookie-policy?lang=en">Cookie政策</a></p>',
      acceptAll: '全部接受',
      rejectNonEssential: '拒绝非必要',
      managePreferences: '管理偏好设置',
      preferencesTitle: 'Cookie偏好设置',
      preferencesDescription: '<p>选择您要接受的Cookie类型。您可以随时更改您的偏好设置。</p>',
      savePreferences: '保存设置',
      essential: '必要',
      essentialDesc: '这些Cookie是网站正常运行所必需的，无法关闭。',
      analytics: '分析',
      analyticsDesc: '这些Cookie帮助我们了解访问者如何与我们的网站互动。',
      marketing: '营销',
      marketingDesc: '这些Cookie用于投放个性化广告。'
    }
  };
  
  let currentLang = 'en';
  let langSelectorElement = null;
  
  // Function to create the language selector element
  function createLanguageSelector() {
    // Remove existing if any
    const existing = document.getElementById('cookie-lang-selector-js');
    if (existing) existing.remove();
    
    // Create the element
    const selector = document.createElement('div');
    selector.id = 'cookie-lang-selector-js';
    selector.style.cssText = 'display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, calc(-50% - 160px)); z-index: 9999999; background: #132A4B; padding: 10px 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3); gap: 10px; align-items: center; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
    
    selector.innerHTML = '<span style="color: rgba(255,255,255,0.7); font-size: 0.85rem; margin-right: 5px;">Language:</span>' +
      '<button type="button" class="lang-btn" data-lang="en" style="background: #D78F00; border: 1px solid #D78F00; color: #fff; padding: 6px 16px; font-size: 0.85rem; border-radius: 4px; cursor: pointer; font-weight: 500; margin-left: 5px;">EN</button>' +
      '<button type="button" class="lang-btn" data-lang="de" style="background: transparent; border: 1px solid rgba(255,255,255,0.4); color: rgba(255,255,255,0.8); padding: 6px 16px; font-size: 0.85rem; border-radius: 4px; cursor: pointer; font-weight: 500; margin-left: 5px;">DE</button>' +
      '<button type="button" class="lang-btn" data-lang="zh" style="background: transparent; border: 1px solid rgba(255,255,255,0.4); color: rgba(255,255,255,0.8); padding: 6px 16px; font-size: 0.85rem; border-radius: 4px; cursor: pointer; font-weight: 500; margin-left: 5px;">中文</button>';
    
    // Add to body
    document.body.appendChild(selector);
    langSelectorElement = selector;
    
    // Add click handlers
    selector.querySelectorAll('.lang-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var lang = this.getAttribute('data-lang');
        currentLang = lang;
        updateBannerLanguage(lang);
        
        // Update button styles
        selector.querySelectorAll('.lang-btn').forEach(function(b) {
          if (b.getAttribute('data-lang') === lang) {
            b.style.background = '#D78F00';
            b.style.borderColor = '#D78F00';
            b.style.color = '#fff';
          } else {
            b.style.background = 'transparent';
            b.style.borderColor = 'rgba(255,255,255,0.4)';
            b.style.color = 'rgba(255,255,255,0.8)';
          }
        });
      });
      
      // Hover effect
      btn.addEventListener('mouseenter', function() {
        if (this.getAttribute('data-lang') !== currentLang) {
          this.style.background = 'rgba(255,255,255,0.15)';
          this.style.color = '#fff';
        }
      });
      btn.addEventListener('mouseleave', function() {
        if (this.getAttribute('data-lang') !== currentLang) {
          this.style.background = 'transparent';
          this.style.color = 'rgba(255,255,255,0.8)';
        }
      });
    });
    
    console.log('[Cookie Language Selector] Created successfully');
    return selector;
  }
  
  // Function to update banner text
  function updateBannerLanguage(lang) {
    var t = cookieTranslations[lang];
    
    // Update prompt description
    var promptDesc = document.querySelector('#stcm-wrapper .stcm-prompt p');
    if (promptDesc) promptDesc.innerHTML = t.promptDescription;
    
    // Update buttons
    var acceptBtn = document.querySelector('#stcm-wrapper button[data-stcm-action="accept-all"]');
    if (acceptBtn) acceptBtn.textContent = t.acceptAll;
    
    var rejectBtn = document.querySelector('#stcm-wrapper button[data-stcm-action="reject-all"]');
    if (rejectBtn) rejectBtn.textContent = t.rejectNonEssential;
    
    var prefsBtn = document.querySelector('#stcm-wrapper button[data-stcm-action="preferences"], #stcm-wrapper a[data-stcm-action="preferences"]');
    if (prefsBtn) prefsBtn.textContent = t.managePreferences;
    
    console.log('[Cookie Language Selector] Language updated to:', lang);
  }
  
  // Function to show/hide language selector
  function updateSelectorVisibility() {
    if (!langSelectorElement) {
      langSelectorElement = createLanguageSelector();
    }
    
    var banner = document.querySelector('#stcm-wrapper .stcm-prompt');
    var backdrop = document.querySelector('#stcm-wrapper .stcm-backdrop');
    
    var bannerVisible = banner && window.getComputedStyle(banner).display !== 'none' && window.getComputedStyle(banner).visibility !== 'hidden';
    var backdropVisible = backdrop && window.getComputedStyle(backdrop).display !== 'none';
    
    if (bannerVisible || backdropVisible) {
      langSelectorElement.style.display = 'flex';
    } else {
      langSelectorElement.style.display = 'none';
    }
  }
  
  // Initialize when DOM is ready
  function init() {
    console.log('[Cookie Language Selector] Initializing...');
    
    // Start checking for banner visibility
    setInterval(updateSelectorVisibility, 200);
    
    // Also use MutationObserver for faster response
    var checkWrapper = function() {
      var wrapper = document.querySelector('#stcm-wrapper');
      if (wrapper) {
        var observer = new MutationObserver(updateSelectorVisibility);
        observer.observe(wrapper, { childList: true, subtree: true, attributes: true });
        console.log('[Cookie Language Selector] MutationObserver attached');
      } else {
        setTimeout(checkWrapper, 100);
      }
    };
    checkWrapper();
    
    // Initial check
    updateSelectorVisibility();
  }
  
  // Start initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
