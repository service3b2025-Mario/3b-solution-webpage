/**
 * Cookie Language Selector for 3B Solution - Version 5
 * Fixes: 
 * 1. Language selector shows on BOTH main banner AND preferences modal
 * 2. ALL text translates including category titles and descriptions
 * 3. Better DOM element detection
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
    if (document.getElementById('cookie-lang-selector-js')) {
      return;
    }
    
    var selector = document.createElement('div');
    selector.id = 'cookie-lang-selector-js';
    selector.style.cssText = 'position: fixed; z-index: 2147483648; background: #1a365d; padding: 8px 15px; border-radius: 8px; display: none; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';
    
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
  
  // Find the visible Silktide element (banner or modal)
  function findVisibleSilktideElement() {
    // Check for modal first (it appears on top)
    var modal = document.querySelector('.stcm-modal');
    if (modal && isElementVisible(modal)) {
      return { element: modal, type: 'modal' };
    }
    
    // Check for the main prompt/banner
    var prompt = document.querySelector('.stcm-prompt');
    if (prompt && isElementVisible(prompt)) {
      return { element: prompt, type: 'banner' };
    }
    
    // Check backdrop as fallback
    var backdrop = document.querySelector('#stcm-backdrop');
    if (backdrop && isElementVisible(backdrop)) {
      // Find the actual content inside backdrop
      var content = backdrop.querySelector('.stcm-prompt, .stcm-modal, [class*="stcm"]');
      if (content && isElementVisible(content)) {
        return { element: content, type: content.classList.contains('stcm-modal') ? 'modal' : 'banner' };
      }
      return { element: backdrop, type: 'banner' };
    }
    
    // Check any stcm element
    var anyStcm = document.querySelector('[class*="stcm"]');
    if (anyStcm && isElementVisible(anyStcm)) {
      return { element: anyStcm, type: 'banner' };
    }
    
    return null;
  }
  
  // Check if element is visible
  function isElementVisible(el) {
    if (!el) return false;
    var style = window.getComputedStyle(el);
    var rect = el.getBoundingClientRect();
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           parseFloat(style.opacity) > 0 &&
           rect.width > 0 && 
           rect.height > 0;
  }
  
  // Position the language selector above the visible element
  function positionSelector() {
    var selector = document.getElementById('cookie-lang-selector-js');
    if (!selector) return;
    
    var found = findVisibleSilktideElement();
    
    if (found) {
      var rect = found.element.getBoundingClientRect();
      
      // Position above the element, centered
      selector.style.position = 'fixed';
      selector.style.top = Math.max(10, rect.top - 50) + 'px';
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
    
    // Update banner text
    updateBannerText(t);
    
    // Update modal text
    updateModalText(t);
    
    // Update all buttons
    updateButtons(t);
    
    console.log('Updated all text to language:', lang);
  }
  
  // Update banner text
  function updateBannerText(t) {
    // Find paragraphs containing cookie message
    var allParagraphs = document.querySelectorAll('p');
    allParagraphs.forEach(function(p) {
      var text = p.textContent.toLowerCase();
      if (text.includes('we use cookies') || 
          text.includes('wir verwenden cookies') || 
          text.includes('我们使用cookie') ||
          text.includes('enhance your browsing') ||
          text.includes('surferlebnis') ||
          text.includes('浏览体验')) {
        
        // Preserve the Cookie Policy link if it exists
        var link = p.querySelector('a');
        if (link) {
          p.innerHTML = t.mainText + ' <a href="/legal/cookie-policy?lang=en" style="color: #D78F00;">' + t.cookiePolicy + '</a>';
        }
      }
    });
    
    // Update standalone Cookie Policy links
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
  
  // Update modal text - using more aggressive text matching
  function updateModalText(t) {
    // Update title
    var allHeadings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    allHeadings.forEach(function(h) {
      var text = h.textContent.trim().toLowerCase();
      if (text.includes('cookie preferences') || text.includes('cookie-einstellungen') || text.includes('cookie偏好设置')) {
        h.textContent = t.preferencesTitle;
      }
    });
    
    // Update all text content - find by current text in any language
    var allElements = document.querySelectorAll('p, span, div, strong, b, label');
    allElements.forEach(function(el) {
      // Skip if has children that are not text nodes
      if (el.children.length > 0 && el.querySelector('button, a, input')) return;
      
      var text = el.textContent.trim().toLowerCase();
      var originalText = el.textContent.trim();
      
      // Preferences description
      if (text.includes('choose which types') || text.includes('wählen sie aus') || text.includes('选择您要接受')) {
        el.textContent = t.preferencesDesc;
      }
      // Essential title
      else if (originalText === 'Essential' || originalText === 'Notwendig' || originalText === '必要') {
        el.textContent = t.essentialTitle;
      }
      // Essential description
      else if (text.includes('necessary for the website to function') || 
               text.includes('für die funktion der website erforderlich') || 
               text.includes('网站正常运行所必需')) {
        el.textContent = t.essentialDesc;
      }
      // Analytics title
      else if (originalText === 'Analytics' || originalText === 'Analytik' || originalText === '分析') {
        el.textContent = t.analyticsTitle;
      }
      // Analytics description
      else if (text.includes('help us understand how visitors interact') || 
               text.includes('helfen uns zu verstehen, wie besucher') || 
               text.includes('帮助我们了解访客如何')) {
        el.textContent = t.analyticsDesc;
      }
      // Marketing title
      else if (originalText === 'Marketing' || originalText === '营销') {
        el.textContent = t.marketingTitle;
      }
      // Marketing description
      else if (text.includes('deliver personalized advertisements') || 
               text.includes('personalisierte werbung zu liefern') || 
               text.includes('提供个性化广告')) {
        el.textContent = t.marketingDesc;
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
  
  // Fix Cookie Policy links
  function fixCookiePolicyLinks() {
    var links = document.querySelectorAll('a[href*="cookie-policy"]');
    links.forEach(function(link) {
      if (!link.href.includes('lang=')) {
        link.href = link.href + (link.href.includes('?') ? '&' : '?') + 'lang=en';
      }
    });
  }
  
  // Main update function
  function update() {
    var found = findVisibleSilktideElement();
    
    if (found) {
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
    }, 200);
    
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
    
    console.log('Cookie Language Selector v5 initialized. Language:', currentLang);
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
