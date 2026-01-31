/**
 * Cookie Language Selector for 3B Solution
 * This script adds language selection buttons (EN/DE/中文) to the Silktide cookie consent banner
 * and ensures Cookie Policy links open in English by default
 */

(function() {
  'use strict';
  
  // Translations for cookie consent
  var translations = {
    en: {
      mainText: 'We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept all", you consent to our use of cookies.',
      acceptAll: 'Accept all',
      rejectNonEssential: 'Reject non-essential',
      managePreferences: 'Manage preferences',
      cookiePolicy: 'Cookie Policy',
      preferencesTitle: 'Cookie Preferences',
      necessaryTitle: 'Necessary',
      necessaryDesc: 'Required for the website to function properly',
      analyticsTitle: 'Analytics',
      analyticsDesc: 'Help us understand how visitors interact with our website',
      marketingTitle: 'Marketing',
      marketingDesc: 'Used to deliver personalized advertisements',
      savePreferences: 'Save preferences'
    },
    de: {
      mainText: 'Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern und unseren Datenverkehr zu analysieren. Durch Klicken auf "Alle akzeptieren" stimmen Sie der Verwendung von Cookies zu.',
      acceptAll: 'Alle akzeptieren',
      rejectNonEssential: 'Nicht wesentliche ablehnen',
      managePreferences: 'Einstellungen verwalten',
      cookiePolicy: 'Cookie-Richtlinie',
      preferencesTitle: 'Cookie-Einstellungen',
      necessaryTitle: 'Notwendig',
      necessaryDesc: 'Erforderlich für die ordnungsgemäße Funktion der Website',
      analyticsTitle: 'Analytik',
      analyticsDesc: 'Helfen Sie uns zu verstehen, wie Besucher mit unserer Website interagieren',
      marketingTitle: 'Marketing',
      marketingDesc: 'Wird verwendet, um personalisierte Werbung zu liefern',
      savePreferences: 'Einstellungen speichern'
    },
    zh: {
      mainText: '我们使用Cookie来增强您的浏览体验并分析我们的流量。点击"全部接受"即表示您同意我们使用Cookie。',
      acceptAll: '全部接受',
      rejectNonEssential: '拒绝非必要',
      managePreferences: '管理偏好',
      cookiePolicy: 'Cookie政策',
      preferencesTitle: 'Cookie偏好设置',
      necessaryTitle: '必要',
      necessaryDesc: '网站正常运行所必需',
      analyticsTitle: '分析',
      analyticsDesc: '帮助我们了解访客如何与我们的网站互动',
      marketingTitle: '营销',
      marketingDesc: '用于提供个性化广告',
      savePreferences: '保存偏好'
    }
  };
  
  var currentLang = 'en';
  
  // Detect browser language
  function detectLanguage() {
    var browserLang = navigator.language || navigator.userLanguage || 'en';
    browserLang = browserLang.toLowerCase().substring(0, 2);
    if (browserLang === 'de') return 'de';
    if (browserLang === 'zh') return 'zh';
    return 'en';
  }
  
  // Create language selector element
  function createLanguageSelector() {
    // Check if already exists
    if (document.getElementById('cookie-lang-selector-js')) {
      return document.getElementById('cookie-lang-selector-js');
    }
    
    var selector = document.createElement('div');
    selector.id = 'cookie-lang-selector-js';
    selector.style.cssText = 'position: fixed; bottom: 180px; left: 50%; transform: translateX(-50%); z-index: 2147483647; display: flex; align-items: center; justify-content: center; background: #132A4B; padding: 8px 16px; border-radius: 8px 8px 0 0; box-shadow: 0 -2px 10px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
    
    var label = document.createElement('span');
    label.style.cssText = 'color: rgba(255,255,255,0.7); font-size: 0.85rem; margin-right: 5px;';
    label.textContent = 'Language:';
    selector.appendChild(label);
    
    var languages = [
      { code: 'en', label: 'EN' },
      { code: 'de', label: 'DE' },
      { code: 'zh', label: '中文' }
    ];
    
    languages.forEach(function(lang) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'lang-btn';
      btn.setAttribute('data-lang', lang.code);
      btn.textContent = lang.label;
      btn.style.cssText = 'background: transparent; border: 1px solid rgba(255,255,255,0.4); color: rgba(255,255,255,0.8); padding: 6px 16px; font-size: 0.85rem; border-radius: 4px; cursor: pointer; font-weight: 500; margin-left: 5px;';
      
      if (lang.code === currentLang) {
        btn.style.background = '#D78F00';
        btn.style.borderColor = '#D78F00';
        btn.style.color = '#fff';
      }
      
      btn.addEventListener('click', function() {
        setLanguage(lang.code);
      });
      
      selector.appendChild(btn);
    });
    
    document.body.appendChild(selector);
    return selector;
  }
  
  // Update button styles when language changes
  function updateButtonStyles() {
    var buttons = document.querySelectorAll('#cookie-lang-selector-js .lang-btn');
    buttons.forEach(function(btn) {
      var lang = btn.getAttribute('data-lang');
      if (lang === currentLang) {
        btn.style.background = '#D78F00';
        btn.style.borderColor = '#D78F00';
        btn.style.color = '#fff';
      } else {
        btn.style.background = 'transparent';
        btn.style.borderColor = 'rgba(255,255,255,0.4)';
        btn.style.color = 'rgba(255,255,255,0.8)';
      }
    });
  }
  
  // Set language and update banner text
  function setLanguage(lang) {
    currentLang = lang;
    updateButtonStyles();
    updateBannerText(lang);
  }
  
  // Update the cookie banner text
  function updateBannerText(lang) {
    var t = translations[lang];
    if (!t) return;
    
    // Update main prompt text - look for various possible selectors
    var promptSelectors = ['.stcm-prompt__text', '.stcm-prompt p', '.stcm-message', '[class*="prompt"] p'];
    promptSelectors.forEach(function(sel) {
      var elements = document.querySelectorAll(sel);
      elements.forEach(function(el) {
        if (el && el.textContent && el.textContent.length > 50) {
          el.textContent = t.mainText;
        }
      });
    });
    
    // Update buttons by looking for common patterns
    var allButtons = document.querySelectorAll('button');
    allButtons.forEach(function(btn) {
      var text = btn.textContent.trim().toLowerCase();
      if (text.includes('accept all') || text.includes('alle akzeptieren') || text.includes('全部接受')) {
        btn.textContent = t.acceptAll;
      } else if (text.includes('reject') || text.includes('ablehnen') || text.includes('拒绝')) {
        btn.textContent = t.rejectNonEssential;
      } else if (text.includes('manage') || text.includes('preferences') || text.includes('einstellungen') || text.includes('管理')) {
        btn.textContent = t.managePreferences;
      } else if (text.includes('save') || text.includes('speichern') || text.includes('保存')) {
        btn.textContent = t.savePreferences;
      }
    });
    
    // Update Cookie Policy link
    var links = document.querySelectorAll('a');
    links.forEach(function(link) {
      var text = link.textContent.trim().toLowerCase();
      if (text.includes('cookie policy') || text.includes('cookie-richtlinie') || text.includes('cookie政策')) {
        link.textContent = t.cookiePolicy;
        // Ensure link goes to English version
        if (link.href && link.href.includes('cookie-policy') && !link.href.includes('lang=')) {
          link.href = link.href + (link.href.includes('?') ? '&' : '?') + 'lang=en';
        }
      }
    });
  }
  
  // Check if cookie banner is visible
  function isBannerVisible() {
    // Check for various Silktide elements
    var selectors = [
      '#stcm-backdrop',
      '.stcm-backdrop',
      '.stcm-prompt',
      '[class*="stcm"]',
      '[id*="stcm"]'
    ];
    
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) {
        var style = window.getComputedStyle(el);
        var rect = el.getBoundingClientRect();
        // Check if element is visible (has dimensions and not hidden)
        if (style.display !== 'none' && 
            style.visibility !== 'hidden' && 
            style.opacity !== '0' &&
            rect.width > 0 && 
            rect.height > 0) {
          return true;
        }
      }
    }
    return false;
  }
  
  // Show/hide language selector based on banner visibility
  function updateSelectorVisibility() {
    var selector = document.getElementById('cookie-lang-selector-js');
    if (!selector) {
      selector = createLanguageSelector();
    }
    
    var bannerVisible = isBannerVisible();
    
    if (bannerVisible) {
      selector.style.display = 'flex';
    } else {
      selector.style.display = 'none';
    }
  }
  
  // Fix Cookie Policy links to always open English version
  function fixCookiePolicyLinks() {
    var links = document.querySelectorAll('a[href*="cookie-policy"]');
    links.forEach(function(link) {
      if (!link.href.includes('lang=')) {
        link.href = link.href + (link.href.includes('?') ? '&' : '?') + 'lang=en';
      }
    });
  }
  
  // Initialize
  function init() {
    // Detect initial language
    currentLang = detectLanguage();
    
    // Create the language selector
    createLanguageSelector();
    
    // Fix Cookie Policy links
    fixCookiePolicyLinks();
    
    // Update banner text with detected language
    updateBannerText(currentLang);
    
    // Check visibility immediately
    updateSelectorVisibility();
    
    // Set up interval to check visibility
    setInterval(updateSelectorVisibility, 300);
    
    // Also watch for DOM changes
    var observer = new MutationObserver(function() {
      updateSelectorVisibility();
      fixCookiePolicyLinks();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    console.log('Cookie Language Selector initialized. Current language:', currentLang);
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Also run after a short delay to ensure Silktide has loaded
  setTimeout(init, 1000);
  setTimeout(init, 2000);
})();
