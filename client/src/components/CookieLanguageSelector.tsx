import { useEffect } from 'react';

/**
 * Cookie Language Selector Component
 * Adds language switching (EN/DE/ZH) to the Silktide cookie consent banner
 */
export function CookieLanguageSelector() {
  useEffect(() => {
    // Prevent double initialization
    if ((window as any).__cookieLangInit) return;
    (window as any).__cookieLangInit = true;

    let currentLang = 'en';

    // Translations
    const t: Record<string, Record<string, string>> = {
      en: {
        mainText: 'We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept all", you consent to our use of cookies.',
        acceptAll: 'Accept all',
        rejectNonEssential: 'Reject non-essential',
        managePreferences: 'Manage preferences',
        cookiePolicy: 'Cookie Policy',
        preferencesTitle: 'Cookie Preferences',
        preferencesDesc: 'Choose which types of cookies you want to accept. You can change your preferences at any time.',
        essentialTitle: 'Essential',
        essentialDesc: 'These cookies are necessary for the website to function and cannot be switched off.',
        analyticsTitle: 'Analytics',
        analyticsDesc: 'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.',
        marketingTitle: 'Marketing',
        marketingDesc: 'These cookies are used to deliver personalized advertisements and measure the effectiveness of our marketing campaigns.',
        savePreferences: 'Save preferences'
      },
      de: {
        mainText: 'Wir verwenden Cookies, um Ihr Surferlebnis zu verbessern und unseren Datenverkehr zu analysieren. Durch Klicken auf "Alle akzeptieren" stimmen Sie der Verwendung von Cookies zu.',
        acceptAll: 'Alle akzeptieren',
        rejectNonEssential: 'Nicht wesentliche ablehnen',
        managePreferences: 'Einstellungen verwalten',
        cookiePolicy: 'Cookie-Richtlinie',
        preferencesTitle: 'Cookie-Einstellungen',
        preferencesDesc: 'Wählen Sie aus, welche Arten von Cookies Sie akzeptieren möchten. Sie können Ihre Einstellungen jederzeit ändern.',
        essentialTitle: 'Notwendig',
        essentialDesc: 'Diese Cookies sind für die Funktion der Website erforderlich und können nicht deaktiviert werden.',
        analyticsTitle: 'Analytik',
        analyticsDesc: 'Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie Informationen anonym sammeln und melden.',
        marketingTitle: 'Marketing',
        marketingDesc: 'Diese Cookies werden verwendet, um personalisierte Werbung zu liefern und die Wirksamkeit unserer Marketingkampagnen zu messen.',
        savePreferences: 'Einstellungen speichern'
      },
      zh: {
        mainText: '我们使用Cookie来增强您的浏览体验并分析我们的流量。点击"全部接受"即表示您同意我们使用Cookie。',
        acceptAll: '全部接受',
        rejectNonEssential: '拒绝非必要',
        managePreferences: '管理偏好设置',
        cookiePolicy: 'Cookie政策',
        preferencesTitle: 'Cookie偏好设置',
        preferencesDesc: '选择您要接受的Cookie类型。您可以随时更改您的偏好设置。',
        essentialTitle: '必要',
        essentialDesc: '这些Cookie是网站正常运行所必需的，无法关闭。',
        analyticsTitle: '分析',
        analyticsDesc: '这些Cookie通过匿名收集和报告信息，帮助我们了解访客如何与我们的网站互动。',
        marketingTitle: '营销',
        marketingDesc: '这些Cookie用于提供个性化广告并衡量我们营销活动的效果。',
        savePreferences: '保存偏好'
      }
    };

    // Create language selector element
    function createSelector(): HTMLDivElement {
      const el = document.createElement('div');
      el.id = 'cookie-lang-selector-js';
      el.style.cssText = 'position:fixed;z-index:2147483647;background:#1e3a5f;padding:8px 16px;border-radius:8px;display:none;font-family:Arial,sans-serif;box-shadow:0 2px 10px rgba(0,0,0,0.3);';
      
      const label = document.createElement('span');
      label.textContent = 'Language: ';
      label.style.cssText = 'color:#fff;font-size:14px;margin-right:8px;';
      el.appendChild(label);

      ['en', 'de', 'zh'].forEach(lang => {
        const btn = document.createElement('button');
        btn.textContent = lang === 'zh' ? '中文' : lang.toUpperCase();
        btn.dataset.lang = lang;
        btn.style.cssText = 'padding:4px 12px;margin:0 4px;border:1px solid #ccc;border-radius:4px;cursor:pointer;font-size:13px;background:' + (lang === currentLang ? '#d4a017' : '#fff') + ';color:' + (lang === currentLang ? '#fff' : '#333') + ';';
        btn.onclick = () => switchLanguage(lang);
        el.appendChild(btn);
      });

      document.body.appendChild(el);
      return el;
    }

    // Update button styles
    function updateButtons() {
      const sel = document.getElementById('cookie-lang-selector-js');
      if (!sel) return;
      sel.querySelectorAll('button').forEach(btn => {
        const lang = (btn as HTMLButtonElement).dataset.lang;
        (btn as HTMLButtonElement).style.background = lang === currentLang ? '#d4a017' : '#fff';
        (btn as HTMLButtonElement).style.color = lang === currentLang ? '#fff' : '#333';
      });
    }

    // Switch language
    function switchLanguage(lang: string) {
      currentLang = lang;
      updateButtons();
      applyTranslations();
    }

    // Apply translations to Silktide elements
    function applyTranslations() {
      const tr = t[currentLang];
      
      // Helper to find and replace text
      const replaceText = (selectors: string[], texts: string[], newText: string) => {
        selectors.forEach(sel => {
          document.querySelectorAll(sel).forEach(el => {
            texts.forEach(txt => {
              if (el.textContent && el.textContent.trim() === txt) {
                el.textContent = newText;
              }
            });
          });
        });
      };

      // Translate buttons
      replaceText(['button'], ['Accept all', 'Alle akzeptieren', '全部接受'], tr.acceptAll);
      replaceText(['button'], ['Reject non-essential', 'Nicht wesentliche ablehnen', '拒绝非必要'], tr.rejectNonEssential);
      replaceText(['button'], ['Manage preferences', 'Einstellungen verwalten', '管理偏好设置'], tr.managePreferences);
      replaceText(['button'], ['Save preferences', 'Einstellungen speichern', '保存偏好'], tr.savePreferences);

      // Translate links
      replaceText(['a'], ['Cookie Policy', 'Cookie-Richtlinie', 'Cookie政策'], tr.cookiePolicy);

      // Translate titles
      replaceText(['h2', 'h3', 'strong', 'b'], ['Cookie Preferences', 'Cookie-Einstellungen', 'Cookie偏好设置'], tr.preferencesTitle);
      replaceText(['h3', 'h4', 'strong', 'b', 'label'], ['Essential', 'Notwendig', '必要'], tr.essentialTitle);
      replaceText(['h3', 'h4', 'strong', 'b', 'label'], ['Analytics', 'Analytik', '分析'], tr.analyticsTitle);
      replaceText(['h3', 'h4', 'strong', 'b', 'label'], ['Marketing', 'Marketing', '营销'], tr.marketingTitle);

      // Translate main text and descriptions (search in all text nodes)
      document.querySelectorAll('p, span, div').forEach(el => {
        const text = el.textContent?.trim() || '';
        
        // Main banner text
        if (text.includes('We use cookies to enhance') || text.includes('Wir verwenden Cookies') || text.includes('我们使用Cookie')) {
          if (el.childNodes.length <= 2) el.textContent = tr.mainText;
        }
        
        // Preferences description
        if (text.includes('Choose which types') || text.includes('Wählen Sie aus') || text.includes('选择您要接受')) {
          el.textContent = tr.preferencesDesc;
        }
        
        // Essential description
        if (text.includes('necessary for the website') || text.includes('für die Funktion') || text.includes('网站正常运行')) {
          el.textContent = tr.essentialDesc;
        }
        
        // Analytics description
        if (text.includes('help us understand how visitors') || text.includes('helfen uns zu verstehen') || text.includes('帮助我们了解访客')) {
          el.textContent = tr.analyticsDesc;
        }
        
        // Marketing description
        if (text.includes('deliver personalized advertisements') || text.includes('personalisierte Werbung') || text.includes('提供个性化广告')) {
          el.textContent = tr.marketingDesc;
        }
      });

      // Fix Cookie Policy links to always open English version
      document.querySelectorAll('a').forEach(a => {
        const href = (a as HTMLAnchorElement).href;
        if (href && href.includes('/legal/cookie-policy') && !href.includes('lang=en')) {
          (a as HTMLAnchorElement).href = href.includes('?') ? href + '&lang=en' : href + '?lang=en';
        }
      });
    }

    // Position selector above visible Silktide element
    function positionSelector(sel: HTMLElement) {
      const backdrop = document.getElementById('stcm-backdrop');
      const modal = document.querySelector('.stcm-modal') as HTMLElement;
      const prompt = document.querySelector('.stcm-prompt') as HTMLElement;
      
      const target = modal || prompt || backdrop;
      if (!target) return;

      const rect = target.getBoundingClientRect();
      const selWidth = sel.offsetWidth || 200;
      
      sel.style.left = Math.max(10, rect.left + (rect.width - selWidth) / 2) + 'px';
      sel.style.top = Math.max(10, rect.top - 50) + 'px';
    }

    // Check if Silktide is visible
    function isSilktideVisible(): boolean {
      const backdrop = document.getElementById('stcm-backdrop');
      if (backdrop && backdrop.style.display !== 'none' && backdrop.offsetParent !== null) {
        return true;
      }
      return false;
    }

    // Main update loop
    function update() {
      let sel = document.getElementById('cookie-lang-selector-js') as HTMLDivElement;
      if (!sel) sel = createSelector();

      if (isSilktideVisible()) {
        sel.style.display = 'block';
        positionSelector(sel);
        applyTranslations();
      } else {
        sel.style.display = 'none';
      }
    }

    // Run update loop
    setInterval(update, 300);
    
    // Initial run
    setTimeout(update, 500);
    setTimeout(update, 1000);
    setTimeout(update, 2000);

  }, []);

  return null;
}

export default CookieLanguageSelector;
