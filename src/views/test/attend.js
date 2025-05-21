const startScript = () => {
  // Existing variables
  const startTime = Date.now();
  let lastActiveTime = startTime;
  let ip = '';

  // New tracking variables
  let focusLostEvents = [];
  let clipboardEvents = [];
  let answerChangeEvents = [];
  let mouseClickEvents = [];
  let keyboardPressEvents = [];
  let firstInteractionTime = null;
  let lastAnswerChangeTime = null;
  let deviceFingerprint = {};
  let deviceType = 'desktop';

  // Get tracking config
  const trackingConfig = window.trackingConfig || {};

  // Determine what to track
  const shouldTrack = {
    focusLost: !trackingConfig.disableFocusLostEvents,
    clipboard: !trackingConfig.disableClipboardEvents,
    preSubmitDelay: !trackingConfig.disablePreSubmitDelay,
    answerChanges: !trackingConfig.disableAnswerChangeEvents,
    deviceFingerprint: !trackingConfig.disableDeviceFingerprint,
    timeToFirstInteraction: !trackingConfig.disableTimeToFirstInteraction,
    mouseClicks: !trackingConfig.disableMouseClickEvents,
    keyboardPresses: !trackingConfig.disableKeyboardPressEvents
  };

  // Get IP
  fetch("https://api.ipify.org")
    .then(res => res.text())
    .then((res) => { ip = res });

  // Detect device type
  const detectDeviceType = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    
    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    return 'desktop';
  };
  deviceType = detectDeviceType();

  // Focus tracking
  if (shouldTrack.focusLost) {
    let focusLostStart = null;
    
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        focusLostStart = Date.now();
      } else if (focusLostStart) {
        focusLostEvents.push({
          timestamp: focusLostStart,
          duration_ms: Date.now() - focusLostStart
        });
        focusLostStart = null;
      }
    });

    window.addEventListener('blur', () => {
      if (!focusLostStart) {
        focusLostStart = Date.now();
      }
    });

    window.addEventListener('focus', () => {
      if (focusLostStart) {
        focusLostEvents.push({
          timestamp: focusLostStart,
          duration_ms: Date.now() - focusLostStart
        });
        focusLostStart = null;
      }
    });
  }

  // Clipboard tracking with content
  if (shouldTrack.clipboard) {
    document.addEventListener('copy', (e) => {
      const selection = window.getSelection().toString();
      clipboardEvents.push({
        timestamp: Date.now(),
        type: 'copy',
        content: selection.substring(0, 100) // Limit to 100 chars
      });
    });

    document.addEventListener('paste', (e) => {
      const content = e.clipboardData?.getData('text/plain') || '';
      clipboardEvents.push({
        timestamp: Date.now(),
        type: 'paste',
        content: content.substring(0, 100) // Limit to 100 chars
      });
    });

    document.addEventListener('cut', (e) => {
      const selection = window.getSelection().toString();
      clipboardEvents.push({
        timestamp: Date.now(),
        type: 'cut',
        content: selection.substring(0, 100)
      });
    });
  }

  // Answer change tracking
  if (shouldTrack.answerChanges) {
    const trackAnswerChange = (input, previousValue, newValue) => {
      const questionId = document.querySelector('input[name="question_id"]').value;
      answerChangeEvents.push({
        question_id: parseInt(questionId),
        previous_answer: previousValue,
        new_answer: newValue,
        timestamp: Date.now(),
        input_type: input.type || 'text'
      });
      lastAnswerChangeTime = Date.now();
    };

    // Track all inputs
    document.addEventListener('input', (e) => {
      if (e.target.name === 'answer' || e.target.name?.startsWith('answer-')) {
        const previousValue = e.target.dataset.previousValue || '';
        trackAnswerChange(e.target, previousValue, e.target.value);
        e.target.dataset.previousValue = e.target.value;
      }
    });

    // Track radio/checkbox changes
    document.addEventListener('change', (e) => {
      if (e.target.type === 'radio' || e.target.type === 'checkbox') {
        const previousValue = e.target.dataset.previousValue || '';
        trackAnswerChange(e.target, previousValue, e.target.value);
        e.target.dataset.previousValue = e.target.value;
      }
    });
  }

  // Mouse click tracking
  if (shouldTrack.mouseClicks) {
    const throttle = (func, limit) => {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    };

    const trackClick = throttle((e) => {
      mouseClickEvents.push({
        timestamp: Date.now(),
        button: e.button === 0 ? 'left' : e.button === 2 ? 'right' : 'middle',
        x: e.clientX,
        y: e.clientY,
        target: e.target.tagName + (e.target.id ? '#' + e.target.id : '')
      });
    }, 100); // Max 10 per second

    document.addEventListener('click', trackClick);
    document.addEventListener('contextmenu', trackClick);
  }

  // Keyboard tracking
  if (shouldTrack.keyboardPresses) {
    const throttle = (func, limit) => {
      let inThrottle;
      return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
          func.apply(context, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      }
    };

    const trackKeypress = throttle((e) => {
      let keyType = 'other';
      
      if (e.key.match(/^[a-zA-Z]$/)) keyType = 'letter';
      else if (e.key.match(/^[0-9]$/)) keyType = 'number';
      else if (e.key === 'Backspace') keyType = 'backspace';
      else if (e.key === 'Enter') keyType = 'enter';
      else if (e.key === ' ') keyType = 'space';
      else if (e.key.startsWith('Arrow')) keyType = 'navigation';
      else if (e.ctrlKey || e.metaKey || e.altKey) keyType = 'modifier';

      keyboardPressEvents.push({
        timestamp: Date.now(),
        keyType: keyType
      });
    }, 100); // Max 10 per second

    document.addEventListener('keydown', trackKeypress);
  }

  // Time to first interaction
  if (shouldTrack.timeToFirstInteraction) {
    const recordFirstInteraction = () => {
      if (!firstInteractionTime) {
        firstInteractionTime = Date.now() - startTime;
        // Remove listeners after first interaction
        document.removeEventListener('click', recordFirstInteraction);
        document.removeEventListener('keydown', recordFirstInteraction);
        document.removeEventListener('input', recordFirstInteraction);
      }
    };

    document.addEventListener('click', recordFirstInteraction);
    document.addEventListener('keydown', recordFirstInteraction);
    document.addEventListener('input', recordFirstInteraction);
  }

  // Device fingerprint
  if (shouldTrack.deviceFingerprint) {
    // Basic fingerprint without library
    const getBasicFingerprint = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('fingerprint', 2, 2);
      const canvasData = canvas.toDataURL();

      return {
        os: navigator.platform,
        browser: navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/)?.[0] || 'Unknown',
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        deviceMemory: navigator.deviceMemory || 'unknown',
        hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        canvasFingerprint: canvasData.substring(0, 50) // Shortened
      };
    };

    // If FingerprintJS is available, use it
    if (window.Fingerprint2) {
      Fingerprint2.get((components) => {
        deviceFingerprint = {
          ...getBasicFingerprint(),
          ...Object.fromEntries(components.map(c => [c.key, c.value]))
        };
      });
    } else {
      deviceFingerprint = getBasicFingerprint();
    }
  }

  // Original tracking variables (backward compatibility)
  let inactiveTime = 0;
  let copyCount = 0;
  let pasteCount = 0;
  let rightClickCount = 0;

  // Original event tracking (keep for backward compatibility)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      lastActiveTime = Date.now();
    } else {
      inactiveTime += Date.now() - lastActiveTime;
    }
  });

  document.addEventListener('copy', () => copyCount++);
  document.addEventListener('paste', () => pasteCount++);
  document.addEventListener('contextmenu', () => rightClickCount++);

  // Form submission
  document.getElementById('answerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const answerType = document.querySelector('input[name="answer_type"]')?.value;
    let answer;
    
    if (answerType === "radiobutton") {
      answer = document.querySelector('input[name="answer"]:checked')?.value;
    } else if (answerType === "multiinput") {
      answer = Array.from(document.querySelectorAll('input[name="answer"]:checked')).map(el => el.value);
    } else if (answerType === "textarea") {
      answer = document.querySelector('textarea[name="answer"]').value.trim();
    } else if (answerType === "multiTextInput") {
      answer = Array.from(document.querySelectorAll('input[name^="answer-"]'))
        .map(el => el.value.trim())
        .filter(val => val !== '');
    }

    if (!answer || (Array.isArray(answer) && answer.length === 0)) {
      alert('Please provide an answer before submitting.');
      return;
    }

    const testId = document.querySelector('input[name="test_id"]')?.value;
    const questionId = document.querySelector('input[name="question_id"]')?.value;
    const userId = document.querySelector('input[name="user_id"]')?.value;

    const timeTaken = Date.now() - startTime;
    
    // Calculate pre-submit delay
    const preSubmitDelay = shouldTrack.preSubmitDelay && lastAnswerChangeTime
      ? (Date.now() - lastAnswerChangeTime) / 1000
      : 0;

    // Limit array sizes to prevent huge payloads
    const limitArray = (arr, limit = 1000) => arr.slice(0, limit);

    const payload = {
      test_id: testId,
      question_id: questionId,
      profile_id: userId,
      answer,
      time_taken: Math.round(timeTaken/1000),
      ip: ip,
      
      // Original metrics
      copy_count: copyCount,
      paste_count: pasteCount,
      right_click_count: rightClickCount,
      inactive_time: Math.round(inactiveTime / 1000),
      
      // New metrics (only if enabled)
      ...(shouldTrack.focusLost && { focus_lost_events: limitArray(focusLostEvents) }),
      ...(shouldTrack.clipboard && { clipboard_events: limitArray(clipboardEvents) }),
      ...(shouldTrack.preSubmitDelay && { pre_submit_delay: preSubmitDelay }),
      ...(shouldTrack.answerChanges && { answer_change_events: limitArray(answerChangeEvents) }),
      ...(shouldTrack.deviceFingerprint && { device_fingerprint: deviceFingerprint }),
      device_type: deviceType, // Always include
      ...(shouldTrack.timeToFirstInteraction && { time_to_first_interaction: firstInteractionTime ? firstInteractionTime / 1000 : 0 }),
      ...(shouldTrack.mouseClicks && { mouse_click_events: limitArray(mouseClickEvents) }),
      ...(shouldTrack.keyboardPresses && { keyboard_press_events: limitArray(keyboardPressEvents) })
    };

    const resultSalt = document.querySelector('input[name="result_salt"]')?.value;
    const encryptionKey = userId + resultSalt;
    
    // Existing encryption logic
    const encryptPayload = (payload, key) => {
      const text = JSON.stringify(payload);
      let result = '';
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
      }
      return btoa(result);
    };

    const encryptedPayload = encryptPayload(payload, encryptionKey);
    
    try {
      const response = await fetch(e.target.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'trc': navigator.userAgent
        },
        body: 'hashed_payload=' + encodeURIComponent(encryptedPayload)
      });

      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });
};

startScript();