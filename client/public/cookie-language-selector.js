/**
 * Cookie Language Selector for 3B Solution - Version 4
 * Fixes: 
 * 1. Language selector as FIXED floating element (positioned above banner, not overlapping)
 * 2. All text translates including main message
 * 3. Preferences modal text also translates
 */

(function() {
  'use strict';
  
  // Complete translations for cookie consent
  var translations = {
    en: {
      // Main banner
      mainText: 'We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept all", you consent to our use of cookies.',
      acceptAll: 'Accept all',
      rejectNonEssential: 'Reject non-essential',
      managePreferences: 'Manage preferences',
      cookiePolicy: 'Cookie Policy',
      // Preferences modal
      preferencesTitle: 'Cookie Preferences',
      preferencesDesc: 'Choose which types of cookies you want to accept. You can change your preferences at any time.',
      essentialTitle: 'Essential',
      essentialDesc: 'These cookies are necessary for the website to function and cannot be switched off.',
      analyticsTitle: 'Analytics',
      analyticsDesc: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
      marketingTitle: 'Marketing',
      marketingDesc: 'These cookies are used to deliver personalized advertisements and measure the effectiveness of our marketing campaigns.',
      savePreferences: 'Save preferences',
      on: 'ON',
      off: 'OFF'
    },
    de: {
      // Main banner
      mainText: 'Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern und unseren Datenverkehr zu analysieren. Durch Klicken auf "Alle akzeptieren" stimmen Sie der Verwendung von Cookies zu.',
      acceptAll: 'Alle akzeptieren',
      rejectNonEssential: 'Nicht wesentliche ablehnen',
      managePreferences: 'Einstellungen verwalten',
      cookiePolicy: 'Cookie-Richtlinie',
      // Preferences modal
      preferencesTitle: 'Cookie-Einstellungen',
      preferencesDesc: 'Wählen Sie aus, welche Arten von Cookies Sie akzeptieren möchten. Sie können Ihre Einstellungen jederzeit ändern.',
      essentialTitle: 'Notwendig',
      essentialDesc: 'Diese Cookies sind für die Funktion der Website erforderlich und können nicht deaktiviert werden.',
      analyticsTitle: 'Analytik',
      analyticsDesc: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie Informationen anonym sammeln und melden.',
      marketingTitle: 'Marketing',
      marketingDesc: 'Diese Cookies werden verwendet, um personalisierte Werbung zu liefern und die Wirksamkeit unserer Marketingkampagnen zu messen.',
      savePreferences: 'Einstellungen speichern',
      on: 'AN',
      off: 'AUS'
    },
    zh: {
      // Main banner
      mainText: '我们使用Cookie来增强您的浏览体验并分析我们的流量。点击"全部接受"即表示您同意我们使用Cookie。',
      acceptAll: '全部接受',
      rejectNonEssential: '拒绝非必要',
      managePreferences: '管理偏好',
      cookiePolicy: 'Cookie政策',
      // Preferences modal
      preferencesTitle: 'Cookie偏好设置',
      preferencesDesc: '选择您要接受的Cookie类型。您可以随时更改您的偏好设置。',
      essentialTitle: '必要',
      essentialDesc: '这些Cookie是网站正常运行所必需的，无法关闭。',
      analyticsTitle: '分析',
      analyticsDesc: '这些Cookie通过匿名收集和报告信息，帮助我们了解访客如何与我们的网站互动。',
      marketingTitle: '营销',
      marketingDesc: '这些Cookie用于提供个性化广告并衡量我们营销活动的效果。',
      savePreferences: '保存偏好',
      on: '开',
      off: '关'
    }
  };
  
  var currentLang = 'en';
  var selectorCreated = false;
  
  // Detect browser language
  function detectLanguage() {
    var browserLang = navigator.language || navigator.userLanguage || 'en';
    browserLang = browserLang.toLowerCase().substring(0, 2);
    if (browserLang === 'de') return 'de';
    if (browserLang === 'zh') return 'zh';
    return 'en';
  }
  
  // Create the floating language selector element
  function createLanguageSelector() {
    if (selectorCreated || document.getElementById('cookie-lang-selector-js')) {
      return;
    }
    
    var selector = document.createElement('div');
    selector.id = 'cookie-lang-selector-js';
    selector.style.cssText = 'position: fixed; bottom: auto; top: 50%; transform: translateY(-50%); left: 50%; margin-left: 0; z-index: 2147483648; background: #1a365d; padding: 8px 15px; border-radius: 8px 8px 0 0; display: none; align-items: center; justify-content: center; box-shadow: 0 -2px 10px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
    
    var html = '<span style="color: rgba(255,255,255,0.8); font-size: 0.85rem; margin-right: 10px;">Language:</span>';
    
    var languages = [
      { code: 'en', label: 'EN' },
      { code: 'de', label: 'DE' },
      { code: 'zh', label: '中文' }
    ];
    
    languages.forEach(function(lang) {
      var isActive = lang.code === currentLang;
      var bgColor = isActive ? '#D78F00' : 'transparent';
      var borderColor = isActive ? '#D78F00' : 'rgba(255,255,255,0.4)';
      var textColor = '#fff';
      
      html += '<button type="button" class="cookie-lang-btn" data-lang="' + lang.code + '" ';
      html += 'style="background: ' + bgColor + '; border: 1px solid ' + borderColor + '; color: ' + textColor + '; ';
      html += 'padding: 5px 14px; font-size: 0.8rem; border-radius: 4px; cursor: pointer; font-weight: 500; margin-left: 5px; transition: all 0.2s;">';
      html += lang.label + '</button>';
    });
    
    selector.innerHTML = html;
    document.body.appendChild(selector);
    selectorCreated = true;
    
    // Add click handlers
    var buttons = selector.querySelectorAll('.cookie-lang-btn');
    buttons.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        setLanguage(btn.getAttribute('data-lang'));
      });
      
      // Hover effects
      btn.addEventListener('mouseenter', function() {
        if (btn.getAttribute('data-lang') !== currentLang) {
          btn.style.background = 'rgba(215, 143, 0, 0.3)';
        }
      });
      btn.addEventListener('mouseleave', function() {
        if (btn.getAttribute('data-lang') !== currentLang) {
          btn.style.background = 'transparent';
        }
      });
    });
    
    console.log('Language selector created');
  }
  
  // Position the language selector above the visible banner/modal
  function positionSelector() {
    var selector = document.getElementById('cookie-lang-selector-js');
    if (!selector) return;
    
    // Find the visible Silktide element
    var banner = document.querySelector('.stcm-prompt');
    var modal = document.querySelector('.stcm-modal, [class*="stcm-modal"]');
    var backdrop = document.querySelector('#stcm-backdrop');
    
    var targetEl = null;
    
    // Check which element is visible
    [modal, banner, backdrop].forEach(function(el) {
      if (el && !targetEl) {
        var style = window.getComputedStyle(el);
        var rect = el.getBoundingClientRect();
        if (style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0) {
          targetEl = el;
        }
      }
    });
    
    if (targetEl) {
      var rect = targetEl.getBoundingClientRect();
      var selectorRect = selector.getBoundingClientRect();
      
      // Position above the banner/modal
      selector.style.position = 'fixed';
      selector.style.top = (rect.top - selectorRect.height - 5) + 'px';
      selector.style.left = '50%';
      selector.style.transform = 'translateX(-50%)';
      selector.style.display = 'flex';
    } else {
      selector.style.display = 'none';
    }
  }
  
  // Update button styles when language changes
  function updateButtonStyles() {
    var buttons = document.querySelectorAll('.cookie-lang-btn');
    buttons.forEach(function(btn) {
      var lang = btn.getAttribute('data-lang');
      if (lang === currentLang) {
        btn.style.background = '#D78F00';
        btn.style.borderColor = '#D78F00';
      } else {
        btn.style.background = 'transparent';
        btn.style.borderColor = 'rgba(255,255,255,0.4)';
      }
    });
  }
  
  // Set language and update all text
  function setLanguage(lang) {
    currentLang = lang;
    updateButtonStyles();
    updateAllText(lang);
  }
  
  // Update all text in both banner and preferences modal
  function updateAllText(lang) {
    var t = translations[lang];
    if (!t) return;
    
    // ===== UPDATE MAIN BANNER =====
    updateBannerText(t);
    
    // ===== UPDATE PREFERENCES MODAL =====
    updateModalText(t);
    
    // ===== UPDATE BUTTONS =====
    updateButtons(t);
    
    console.log('Updated all text to language:', lang);
  }
  
  // Update banner text
  function updateBannerText(t) {
    // Find all paragraphs that might contain the cookie message
    var paragraphs = document.querySelectorAll('p');
    paragraphs.forEach(function(p) {
      var text = p.textContent.toLowerCase();
      // Check if this is the cookie message
      if ((text.includes('we use cookies') || text.includes('wir verwenden cookies') || text.includes('我们使用cookie')) ||
          (text.includes('cookies to enhance') || text.includes('surferlebnis') || text.includes('浏览体验'))) {
        // Check if there's a link inside
        var link = p.querySelector('a');
        if (link) {
          p.innerHTML = t.mainText + ' <a href="/legal/cookie-policy?lang=en" style="color: #D78F00;">' + t.cookiePolicy + '</a>';
        }
      }
    });
    
    // Update Cookie Policy links
    var links = document.querySelectorAll('a');
    links.forEach(function(link) {
      var text = link.textContent.trim().toLowerCase();
      if (text === 'cookie policy' || text === 'cookie-richtlinie' || text === 'cookie政策') {
        link.textContent = t.cookiePolicy;
        if (!link.href.includes('lang=')) {
          link.href = '/legal/cookie-policy?lang=en';
        }
      }
    });
  }
  
  // Update modal text
  function updateModalText(t) {
    // Find all headings and update titles
    var headings = document.querySelectorAll('h1, h2, h3, h4, strong, b');
    headings.forEach(function(h) {
      var text = h.textContent.trim().toLowerCase();
      
      if (text === 'cookie preferences' || text === 'cookie-einstellungen' || text === 'cookie偏好设置') {
        h.textContent = t.preferencesTitle;
      }
      else if (text === 'essential' || text === 'notwendig' || text === '必要') {
        h.textContent = t.essentialTitle;
      }
      else if (text === 'analytics' || text === 'analytik' || text === '分析') {
        h.textContent = t.analyticsTitle;
      }
      else if (text === 'marketing' || text === '营销') {
        h.textContent = t.marketingTitle;
      }
    });
    
    // Find all paragraphs and update descriptions
    var paragraphs = document.querySelectorAll('p');
    paragraphs.forEach(function(p) {
      var text = p.textContent.toLowerCase();
      
      if (text.includes('choose which types') || text.includes('wählen sie aus') || text.includes('选择您要接受')) {
        p.textContent = t.preferencesDesc;
      }
      else if (text.includes('necessary for the website') || text.includes('für die funktion der website') || text.includes('网站正常运行所必需')) {
        p.textContent = t.essentialDesc;
      }
      else if (text.includes('help us understand how visitors') || text.includes('helfen uns zu verstehen') || text.includes('帮助我们了解访客')) {
        p.textContent = t.analyticsDesc;
      }
      else if (text.includes('deliver personalized advertisements') || text.includes('personalisierte werbung') || text.includes('提供个性化广告')) {
        p.textContent = t.marketingDesc;
      }
    });
  }
  
  // Update all buttons
  function updateButtons(t) {
    var buttons = document.querySelectorAll('button');
    buttons.forEach(function(btn) {
      // Skip language buttons
      if (btn.classList.contains('cookie-lang-btn')) return;
      
      var text = btn.textContent.trim().toLowerCase();
      
      // Accept all
      if (text === 'accept all' || text === 'alle akzeptieren' || text === '全部接受') {
        btn.textContent = t.acceptAll;
      }
      // Reject non-essential
      else if (text === 'reject non-essential' || text === 'nicht wesentliche ablehnen' || text === '拒绝非必要') {
        btn.textContent = t.rejectNonEssential;
      }
      // Manage preferences
      else if (text === 'manage preferences' || text === 'einstellungen verwalten' || text === '管理偏好') {
        btn.textContent = t.managePreferences;
      }
      // Save preferences
      else if (text === 'save preferences' || text === 'einstellungen speichern' || text === '保存偏好') {
        btn.textContent = t.savePreferences;
      }
    });
  }
  
  // Check if any Silktide element is visible
  function isSilktideVisible() {
    var selectors = ['#stcm-backdrop', '.stcm-backdrop', '.stcm-prompt', '.stcm-modal', '[class*="stcm"]'];
    
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) {
        var style = window.getComputedStyle(el);
        var rect = el.getBoundingClientRect();
        if (style.display !== 'none' && 
            style.visibility !== 'hidden' && 
            parseFloat(style.opacity) > 0 &&
            rect.width > 0 && 
            rect.height > 0) {
          return true;
        }
      }
    }
    return false;
  }
  
  // Main update function
  function update() {
    if (isSilktideVisible()) {
      createLanguageSelector();
      positionSelector();
      updateAllText(currentLang);
    } else {
      var selector = document.getElementById('cookie-lang-selector-js');
      if (selector) {
        selector.style.display = 'none';
      }
    }
  }
  
  // Fix Cookie Policy links
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
    currentLang = detectLanguage();
    
    // Initial update
    update();
    fixCookiePolicyLinks();
    
    // Set up interval to check for banner
    setInterval(function() {
      update();
      fixCookiePolicyLinks();
    }, 300);
    
    // Watch for DOM changes
    var observer = new MutationObserver(function(mutations) {
      setTimeout(function() {
        update();
        fixCookiePolicyLinks();
      }, 50);
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    console.log('Cookie Language Selector v4 initialized. Language:', currentLang);
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Also run after delays to ensure Silktide has loaded
  setTimeout(init, 500);
  setTimeout(init, 1000);
  setTimeout(init, 2000);
})();
