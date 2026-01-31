import { useEffect } from 'react';

/**
 * Cookie Language Selector Component
 * This component injects the language selector script for the Silktide cookie consent banner.
 * It runs once when the app mounts and handles all the language switching functionality.
 */
export function CookieLanguageSelector() {
  useEffect(() => {
    // Only run once
    if ((window as any).__cookieLangSelectorInitialized) return;
    (window as any).__cookieLangSelectorInitialized = true;

    const translations: Record<string, Record<string, string>> = {
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
        managePreferences: '管理偏好',
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

    let currentLang = 'en';

    function detectLanguage(): string {
      const browserLang = (navigator.language || (navigator as any).userLanguage || 'en').toLowerCase().substring(0, 2);
      if (browserLang === 'de') return 'de';
      if (browserLang === 'zh') return 'zh';
      return 'en';
    }

    function isElementVisible(el: Element | null): boolean {
      if (!el) return false;
      const style = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && parseFloat(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
    }

    function findCookieCard(): Element | null {
      const modal = document.querySelector('.stcm-modal');
      if (modal && isElementVisible(modal)) return modal;
      
      const prompt = document.querySelector('.stcm-prompt');
      if (prompt && isElementVisible(prompt)) return prompt;
      
      const backdrop = document.querySelector('#stcm-backdrop');
      if (backdrop && isElementVisible(backdrop)) {
        const card = backdrop.querySelector('.stcm-prompt, .stcm-modal, [role="dialog"]');
        if (card && isElementVisible(card)) return card;
        const rect = backdrop.getBoundingClientRect();
        if (rect.width < window.innerWidth * 0.9) return backdrop;
      }
      return null;
    }

    function createLanguageSelector(): HTMLElement {
      let selector = document.getElementById('cookie-lang-selector-react');
      if (selector) return selector;

      selector = document.createElement('div');
      selector.id = 'cookie-lang-selector-react';
      selector.style.cssText = 'position: fixed; z-index: 2147483648; background: #1a365d; padding: 8px 15px; border-radius: 8px; display: none; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.3); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';

      const langs = [
        { code: 'en', label: 'EN' },
        { code: 'de', label: 'DE' },
        { code: 'zh', label: '中文' }
      ];

      let html = '<span style="color: rgba(255,255,255,0.8); font-size: 0.85rem; margin-right: 10px;">Language:</span>';
      langs.forEach(lang => {
        const isActive = lang.code === currentLang;
        const bgColor = isActive ? '#D78F00' : 'transparent';
        const borderColor = isActive ? '#D78F00' : 'rgba(255,255,255,0.4)';
        html += `<button type="button" class="cookie-lang-btn" data-lang="${lang.code}" style="background: ${bgColor}; border: 1px solid ${borderColor}; color: #fff; padding: 5px 14px; font-size: 0.8rem; border-radius: 4px; cursor: pointer; font-weight: 500; margin-left: 5px; transition: all 0.2s;">${lang.label}</button>`;
      });

      selector.innerHTML = html;
      document.body.appendChild(selector);

      selector.querySelectorAll('.cookie-lang-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          setLanguage((btn as HTMLElement).getAttribute('data-lang') || 'en');
        });
        btn.addEventListener('mouseenter', () => {
          if ((btn as HTMLElement).getAttribute('data-lang') !== currentLang) {
            (btn as HTMLElement).style.background = 'rgba(215, 143, 0, 0.3)';
          }
        });
        btn.addEventListener('mouseleave', () => {
          if ((btn as HTMLElement).getAttribute('data-lang') !== currentLang) {
            (btn as HTMLElement).style.background = 'transparent';
          }
        });
      });

      return selector;
    }

    function positionSelector(selector: HTMLElement, card: Element): void {
      const cardRect = card.getBoundingClientRect();
      let top = cardRect.top - 50;
      if (top < 10) top = 10;
      selector.style.top = `${top}px`;
      selector.style.left = `${cardRect.left + cardRect.width / 2}px`;
      selector.style.transform = 'translateX(-50%)';
      selector.style.display = 'flex';
    }

    function hideSelector(): void {
      const selector = document.getElementById('cookie-lang-selector-react');
      if (selector) selector.style.display = 'none';
    }

    function updateButtonStyles(): void {
      document.querySelectorAll('.cookie-lang-btn').forEach(btn => {
        const lang = (btn as HTMLElement).getAttribute('data-lang');
        (btn as HTMLElement).style.background = lang === currentLang ? '#D78F00' : 'transparent';
        (btn as HTMLElement).style.borderColor = lang === currentLang ? '#D78F00' : 'rgba(255,255,255,0.4)';
      });
    }

    function setLanguage(lang: string): void {
      currentLang = lang;
      updateButtonStyles();
      updateAllText(lang);
    }

    function updateAllText(lang: string): void {
      const t = translations[lang];
      if (!t) return;

      // Update headings
      document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        const text = h.textContent?.trim().toLowerCase() || '';
        if (text.includes('cookie preferences') || text.includes('cookie-einstellungen') || text.includes('cookie偏好设置')) {
          h.textContent = t.preferencesTitle;
        }
      });

      // Update text elements
      document.querySelectorAll('p, span, div, strong, b, label').forEach(el => {
        if (el.children.length > 0 && el.querySelector('button, a, input')) return;
        const text = el.textContent?.trim().toLowerCase() || '';
        const originalText = el.textContent?.trim() || '';

        if (text.includes('we use cookies') || text.includes('wir verwenden cookies') || text.includes('我们使用cookie')) {
          el.textContent = t.mainText;
        }
        else if (text.includes('choose which types') || text.includes('wählen sie aus') || text.includes('选择您要接受')) {
          el.textContent = t.preferencesDesc;
        }
        else if (originalText === 'Essential' || originalText === 'Notwendig' || originalText === '必要') {
          el.textContent = t.essentialTitle;
        }
        else if (text.includes('necessary for the website to function') || text.includes('für die funktion der website') || text.includes('网站正常运行所必需')) {
          el.textContent = t.essentialDesc;
        }
        else if (originalText === 'Analytics' || originalText === 'Analytik' || originalText === '分析') {
          el.textContent = t.analyticsTitle;
        }
        else if (text.includes('help us understand how visitors') || text.includes('helfen uns zu verstehen') || text.includes('帮助我们了解访客')) {
          el.textContent = t.analyticsDesc;
        }
        else if (originalText === 'Marketing' || originalText === '营销') {
          el.textContent = t.marketingTitle;
        }
        else if (text.includes('deliver personalized advertisements') || text.includes('personalisierte werbung') || text.includes('提供个性化广告')) {
          el.textContent = t.marketingDesc;
        }
      });

      // Update buttons
      document.querySelectorAll('button').forEach(btn => {
        if (btn.classList.contains('cookie-lang-btn')) return;
        const text = btn.textContent?.trim().toLowerCase() || '';
        if (text === 'accept all' || text === 'alle akzeptieren' || text === '全部接受') btn.textContent = t.acceptAll;
        else if (text === 'reject non-essential' || text === 'nicht wesentliche ablehnen' || text === '拒绝非必要') btn.textContent = t.rejectNonEssential;
        else if (text === 'manage preferences' || text === 'einstellungen verwalten' || text === '管理偏好') btn.textContent = t.managePreferences;
        else if (text === 'save preferences' || text === 'einstellungen speichern' || text === '保存偏好') btn.textContent = t.savePreferences;
      });

      // Update Cookie Policy links
      document.querySelectorAll('a').forEach(link => {
        const text = link.textContent?.trim().toLowerCase() || '';
        if (text === 'cookie policy' || text === 'cookie-richtlinie' || text === 'cookie政策') {
          link.textContent = t.cookiePolicy;
          if (!link.href.includes('lang=')) link.href = '/legal/cookie-policy?lang=en';
        }
      });
    }

    function update(): void {
      const card = findCookieCard();
      if (card) {
        const selector = createLanguageSelector();
        positionSelector(selector, card);
        updateAllText(currentLang);
      } else {
        hideSelector();
      }
    }

    // Initialize
    currentLang = detectLanguage();
    update();
    
    // Set up interval
    const intervalId = setInterval(update, 200);

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(update, 50);
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    console.log('[Cookie Language Selector] React component initialized. Language:', currentLang);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}

export default CookieLanguageSelector;
