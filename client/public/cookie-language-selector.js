/**
 * Cookie Language Selector for 3B Solution - Version 3
 * Fixes: 
 * 1. Language selector positioned INSIDE the banner (not overlapping)
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
  var selectorInjected = false;
  
  // Detect browser language
  function detectLanguage() {
    var browserLang = navigator.language || navigator.userLanguage || 'en';
    browserLang = browserLang.toLowerCase().substring(0, 2);
    if (browserLang === 'de') return 'de';
    if (browserLang === 'zh') return 'zh';
    return 'en';
  }
  
  // Create language selector HTML
  function createLanguageSelectorHTML() {
    var html = '<div id="cookie-lang-selector-js" style="display: flex; align-items: center; justify-content: flex-start; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.2);">';
    html += '<span style="color: rgba(255,255,255,0.7); font-size: 0.85rem; margin-right: 8px;">Language:</span>';
    
    var languages = [
      { code: 'en', label: 'EN' },
      { code: 'de', label: 'DE' },
      { code: 'zh', label: '中文' }
    ];
    
    languages.forEach(function(lang) {
      var isActive = lang.code === currentLang;
      var bgColor = isActive ? '#D78F00' : 'transparent';
      var borderColor = isActive ? '#D78F00' : 'rgba(255,255,255,0.4)';
      var textColor = isActive ? '#fff' : 'rgba(255,255,255,0.8)';
      
      html += '<button type="button" class="cookie-lang-btn" data-lang="' + lang.code + '" ';
      html += 'style="background: ' + bgColor + '; border: 1px solid ' + borderColor + '; color: ' + textColor + '; ';
      html += 'padding: 5px 14px; font-size: 0.8rem; border-radius: 4px; cursor: pointer; font-weight: 500; margin-left: 5px;">';
      html += lang.label + '</button>';
    });
    
    html += '</div>';
    return html;
  }
  
  // Inject language selector into the banner
  function injectLanguageSelector() {
    if (selectorInjected) return;
    
    // Find the Silktide prompt container
    var prompt = document.querySelector('.stcm-prompt');
    if (!prompt) return;
    
    // Check if already injected
    if (document.getElementById('cookie-lang-selector-js')) {
      selectorInjected = true;
      return;
    }
    
    // Find the first child element to insert before
    var firstChild = prompt.firstElementChild;
    if (firstChild) {
      var selectorDiv = document.createElement('div');
      selectorDiv.innerHTML = createLanguageSelectorHTML();
      var selector = selectorDiv.firstElementChild;
      prompt.insertBefore(selector, firstChild);
      selectorInjected = true;
      
      // Add click handlers
      var buttons = selector.querySelectorAll('.cookie-lang-btn');
      buttons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
          e.preventDefault();
          e.stopPropagation();
          setLanguage(btn.getAttribute('data-lang'));
        });
      });
      
      console.log('Language selector injected into banner');
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
        btn.style.color = '#fff';
      } else {
        btn.style.background = 'transparent';
        btn.style.borderColor = 'rgba(255,255,255,0.4)';
        btn.style.color = 'rgba(255,255,255,0.8)';
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
    
    // Find and update the main text paragraph
    // Silktide typically uses a paragraph inside .stcm-prompt
    var textElements = document.querySelectorAll('.stcm-prompt p, .stcm-prompt__text, .stcm-message');
    textElements.forEach(function(el) {
      // Only update if it looks like the cookie message (contains "cookies" or similar)
      var text = el.textContent.toLowerCase();
      if (text.includes('cookie') || text.includes('traffic') || text.includes('browsing') || 
          text.includes('datenverkehr') || text.includes('surferlebnis') ||
          text.includes('流量') || text.includes('浏览')) {
        // Find the Cookie Policy link inside
        var link = el.querySelector('a');
        if (link) {
          // Preserve the link
          el.innerHTML = t.mainText + ' <a href="/legal/cookie-policy?lang=en" style="color: #D78F00;">' + t.cookiePolicy + '</a>';
        } else {
          el.textContent = t.mainText;
        }
      }
    });
    
    // Also try to find text nodes directly
    var prompt = document.querySelector('.stcm-prompt');
    if (prompt) {
      // Look for the text that contains the cookie message
      var walker = document.createTreeWalker(prompt, NodeFilter.SHOW_TEXT, null, false);
      var node;
      while (node = walker.nextNode()) {
        var text = node.textContent.toLowerCase();
        if ((text.includes('we use cookies') || text.includes('wir verwenden cookies') || text.includes('我们使用cookie')) && text.length > 50) {
          node.textContent = t.mainText;
        }
      }
    }
    
    // Update Cookie Policy link
    var policyLinks = document.querySelectorAll('a[href*="cookie-policy"], a[href*="cookie"]');
    policyLinks.forEach(function(link) {
      var text = link.textContent.toLowerCase();
      if (text.includes('cookie policy') || text.includes('cookie-richtlinie') || text.includes('cookie政策') || text === 'cookie policy') {
        link.textContent = t.cookiePolicy;
        // Ensure English version
        if (!link.href.includes('lang=')) {
          link.href = '/legal/cookie-policy?lang=en';
        }
      }
    });
    
    // Update main banner buttons
    var allButtons = document.querySelectorAll('.stcm-prompt button, .stcm-buttons button');
    allButtons.forEach(function(btn) {
      var text = btn.textContent.trim().toLowerCase();
      // Accept all
      if (text.includes('accept all') || text.includes('alle akzeptieren') || text.includes('全部接受') || text === 'accept all') {
        btn.textContent = t.acceptAll;
      }
      // Reject non-essential
      else if (text.includes('reject') || text.includes('ablehnen') || text.includes('拒绝') || text.includes('non-essential') || text.includes('wesentliche')) {
        btn.textContent = t.rejectNonEssential;
      }
      // Manage preferences
      else if (text.includes('manage') || text.includes('preferences') || text.includes('einstellungen verwalten') || text.includes('管理')) {
        btn.textContent = t.managePreferences;
      }
      // Save preferences
      else if (text.includes('save') || text.includes('speichern') || text.includes('保存')) {
        btn.textContent = t.savePreferences;
      }
    });
    
    // ===== UPDATE PREFERENCES MODAL =====
    
    // Find the preferences modal
    var modal = document.querySelector('.stcm-modal, .stcm-preferences, [class*="stcm-modal"]');
    if (modal) {
      // Update modal title
      var titles = modal.querySelectorAll('h1, h2, h3, .stcm-modal__title');
      titles.forEach(function(title) {
        var text = title.textContent.toLowerCase();
        if (text.includes('cookie') && (text.includes('preferences') || text.includes('einstellungen') || text.includes('偏好'))) {
          title.textContent = t.preferencesTitle;
        }
      });
      
      // Update modal description
      var descs = modal.querySelectorAll('p');
      descs.forEach(function(desc) {
        var text = desc.textContent.toLowerCase();
        if (text.includes('choose which') || text.includes('wählen sie') || text.includes('选择')) {
          desc.textContent = t.preferencesDesc;
        }
      });
      
      // Update category titles and descriptions
      var categories = modal.querySelectorAll('.stcm-category, .stcm-toggle, [class*="category"], [class*="toggle"]');
      categories.forEach(function(cat) {
        var titleEl = cat.querySelector('h3, h4, .stcm-category__title, strong, b');
        var descEl = cat.querySelector('p, .stcm-category__desc, span');
        
        if (titleEl) {
          var titleText = titleEl.textContent.toLowerCase();
          
          // Essential/Necessary
          if (titleText.includes('essential') || titleText.includes('necessary') || titleText.includes('notwendig') || titleText.includes('必要')) {
            titleEl.textContent = t.essentialTitle;
            if (descEl) {
              var descText = descEl.textContent.toLowerCase();
              if (descText.includes('necessary') || descText.includes('function') || descText.includes('erforderlich') || descText.includes('必需')) {
                descEl.textContent = t.essentialDesc;
              }
            }
          }
          // Analytics
          else if (titleText.includes('analytics') || titleText.includes('analytik') || titleText.includes('分析')) {
            titleEl.textContent = t.analyticsTitle;
            if (descEl) {
              var descText = descEl.textContent.toLowerCase();
              if (descText.includes('understand') || descText.includes('visitors') || descText.includes('verstehen') || descText.includes('了解')) {
                descEl.textContent = t.analyticsDesc;
              }
            }
          }
          // Marketing
          else if (titleText.includes('marketing') || titleText.includes('营销')) {
            titleEl.textContent = t.marketingTitle;
            if (descEl) {
              var descText = descEl.textContent.toLowerCase();
              if (descText.includes('personalized') || descText.includes('advertisements') || descText.includes('personalisierte') || descText.includes('个性化')) {
                descEl.textContent = t.marketingDesc;
              }
            }
          }
        }
      });
      
      // Also try a more direct approach - find all text in modal
      updateModalTextDirect(modal, t);
    }
    
    // Also update any standalone text elements
    updateStandaloneElements(t);
    
    console.log('Updated all text to language:', lang);
  }
  
  // Direct text replacement in modal
  function updateModalTextDirect(modal, t) {
    // Get all text-containing elements
    var elements = modal.querySelectorAll('h1, h2, h3, h4, p, span, strong, b, label');
    
    elements.forEach(function(el) {
      var text = el.textContent.trim();
      var textLower = text.toLowerCase();
      
      // Skip if it's a button or has child elements with text
      if (el.tagName === 'BUTTON') return;
      if (el.children.length > 0 && el.querySelector('button, a')) return;
      
      // Title
      if (textLower === 'cookie preferences' || textLower === 'cookie-einstellungen' || textLower === 'cookie偏好设置') {
        el.textContent = t.preferencesTitle;
      }
      // Essential
      else if (textLower === 'essential' || textLower === 'notwendig' || textLower === '必要') {
        el.textContent = t.essentialTitle;
      }
      // Analytics
      else if (textLower === 'analytics' || textLower === 'analytik' || textLower === '分析') {
        el.textContent = t.analyticsTitle;
      }
      // Marketing
      else if (textLower === 'marketing' || textLower === '营销') {
        el.textContent = t.marketingTitle;
      }
      // Descriptions - check for key phrases
      else if (textLower.includes('necessary for the website to function') || 
               textLower.includes('erforderlich für die funktion') ||
               textLower.includes('网站正常运行所必需')) {
        el.textContent = t.essentialDesc;
      }
      else if (textLower.includes('help us understand how visitors') || 
               textLower.includes('helfen uns zu verstehen') ||
               textLower.includes('帮助我们了解访客')) {
        el.textContent = t.analyticsDesc;
      }
      else if (textLower.includes('deliver personalized advertisements') || 
               textLower.includes('personalisierte werbung') ||
               textLower.includes('提供个性化广告')) {
        el.textContent = t.marketingDesc;
      }
      else if (textLower.includes('choose which types') || 
               textLower.includes('wählen sie aus') ||
               textLower.includes('选择您要接受')) {
        el.textContent = t.preferencesDesc;
      }
    });
    
    // Update buttons in modal
    var modalButtons = modal.querySelectorAll('button');
    modalButtons.forEach(function(btn) {
      var text = btn.textContent.trim().toLowerCase();
      if (text.includes('save') || text.includes('speichern') || text.includes('保存')) {
        btn.textContent = t.savePreferences;
      }
      else if (text.includes('reject') || text.includes('ablehnen') || text.includes('拒绝')) {
        btn.textContent = t.rejectNonEssential;
      }
    });
  }
  
  // Update any standalone elements outside the main containers
  function updateStandaloneElements(t) {
    // Find all buttons on the page that might be cookie-related
    var allButtons = document.querySelectorAll('button');
    allButtons.forEach(function(btn) {
      // Skip language buttons
      if (btn.classList.contains('cookie-lang-btn')) return;
      
      var text = btn.textContent.trim().toLowerCase();
      
      // Only update if it's clearly a cookie consent button
      if (text === 'accept all' || text === 'alle akzeptieren' || text === '全部接受') {
        btn.textContent = t.acceptAll;
      }
      else if (text === 'reject non-essential' || text === 'nicht wesentliche ablehnen' || text === '拒绝非必要') {
        btn.textContent = t.rejectNonEssential;
      }
      else if (text === 'manage preferences' || text === 'einstellungen verwalten' || text === '管理偏好') {
        btn.textContent = t.managePreferences;
      }
      else if (text === 'save preferences' || text === 'einstellungen speichern' || text === '保存偏好') {
        btn.textContent = t.savePreferences;
      }
    });
  }
  
  // Check if cookie banner is visible
  function isBannerVisible() {
    var selectors = ['#stcm-backdrop', '.stcm-backdrop', '.stcm-prompt'];
    
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
    if (isBannerVisible()) {
      injectLanguageSelector();
      updateAllText(currentLang);
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
    }, 500);
    
    // Watch for DOM changes
    var observer = new MutationObserver(function(mutations) {
      // Check if any mutation added the banner or modal
      var shouldUpdate = mutations.some(function(m) {
        return m.addedNodes.length > 0 || m.attributeName === 'style' || m.attributeName === 'class';
      });
      
      if (shouldUpdate) {
        setTimeout(function() {
          update();
          fixCookiePolicyLinks();
        }, 100);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
    
    console.log('Cookie Language Selector v3 initialized. Language:', currentLang);
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
