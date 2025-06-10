const startScript = () => {
  // Browser compatibility checks
  const browserSupport = {
    visibilityAPI: typeof document.hidden !== 'undefined',
    clipboardAPI: typeof navigator.clipboard !== 'undefined',
    deviceMemory: typeof navigator.deviceMemory !== 'undefined',
    hardwareConcurrency: typeof navigator.hardwareConcurrency !== 'undefined',
    webGL: !!window.WebGLRenderingContext,
    audioContext: !!(window.AudioContext || window.webkitAudioContext),
    intl: typeof Intl !== 'undefined'
  };

  // Existing variables
  const startTime = Date.now();
  let lastActiveTime = startTime;
  let ip = '';

  // New tracking variables
  let focusEvents = [];
  let clipboardEvents = [];
  let answerChangeEvents = [];
  let mouseClickEvents = [];
  let keyboardPressEvents = [];
  let firstInteractionTime = null;
  let lastAnswerChangeTime = null;
  let deviceFingerprint = {};
  let deviceType = 'desktop';

  // Get tracking config (fix variable shadowing)
  const config = window.trackingConfig || {};

  // Determine what to track (with browser support checks)
  const shouldTrack = {
    focusEvents: !config.disableFocusEvents && browserSupport.visibilityAPI,
    clipboard: !config.disableClipboardEvents,
    preSubmitDelay: !config.disablePreSubmitDelay,
    answerChanges: !config.disableAnswerChangeEvents,
    deviceFingerprint: !config.disableDeviceFingerprint,
    timeToFirstInteraction: !config.disableTimeToFirstInteraction,
    mouseClicks: !config.disableMouseClickEvents,
    keyboardPresses: !config.disableKeyboardPressEvents
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

  // New Focus Events tracking - only initialize if enabled
  let currentFocusState = 'active'; // Start as active since user just loaded the page
  let focusStateStart = Date.now();

  if (shouldTrack.focusEvents) {

    // Record initial active state
    focusEvents.push({
      timestamp: focusStateStart,
      duration_ms: 0, // Will be updated when state changes
      type: 'active'
    });

    const handleFocusStateChange = (newState) => {
      const now = Date.now();
      const duration = now - focusStateStart;

      // Update the duration of the current event
      if (focusEvents.length > 0) {
        focusEvents[focusEvents.length - 1].duration_ms = duration;
      }

      // Add new event for the new state
      focusEvents.push({
        timestamp: now,
        duration_ms: 0, // Will be updated on next state change
        type: newState
      });

      currentFocusState = newState;
      focusStateStart = now;
    };

    const handleVisibilityChangeFocus = () => {
      const newState = document.hidden ? 'inactive' : 'active';
      if (newState !== currentFocusState) {
        handleFocusStateChange(newState);
      }
    };

    const handleWindowBlurFocus = () => {
      if (currentFocusState !== 'inactive') {
        handleFocusStateChange('inactive');
      }
    };

    const handleWindowFocusFocus = () => {
      if (currentFocusState !== 'active') {
        handleFocusStateChange('active');
      }
    };

    // Add event listeners for new focus tracking
    document.addEventListener('visibilitychange', handleVisibilityChangeFocus);
    window.addEventListener('blur', handleWindowBlurFocus);
    window.addEventListener('focus', handleWindowFocusFocus);

    // Update the final duration when the page is about to unload
    window.addEventListener('beforeunload', () => {
      if (focusEvents.length > 0) {
        focusEvents[focusEvents.length - 1].duration_ms = Date.now() - focusStateStart;
      }
    });
  }

  // Clipboard tracking - only initialize if enabled
  if (shouldTrack.clipboard) {
    const handleCopy = () => {
      const selection = window.getSelection().toString().trim();
      // Only record if there's actual content being copied
      if (selection.length > 0) {
        clipboardEvents.push({
          timestamp: Date.now(),
          type: 'copy',
          content: selection.substring(0, 100) // Limit to 100 chars
        });
      }
    };

    const handlePaste = (e) => {
      const content = (e.clipboardData?.getData('text/plain') || '').trim();
      // Only record if there's actual content being pasted
      if (content.length > 0) {
        clipboardEvents.push({
          timestamp: Date.now(),
          type: 'paste',
          content: content.substring(0, 100) // Limit to 100 chars
        });
      }
    };

    const handleCut = () => {
      const selection = window.getSelection().toString().trim();
      // Only record if there's actual content being cut
      if (selection.length > 0) {
        clipboardEvents.push({
          timestamp: Date.now(),
          type: 'cut',
          content: selection.substring(0, 100)
        });
      }
    };

    // Only add event listeners if clipboard tracking is enabled
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('cut', handleCut);
  }

  // Answer change tracking - only initialize if enabled
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

    const handleTextInput = (e) => {
      if ((e.target.name === 'answer' || e.target.name?.startsWith('answer-')) &&
          e.target.type !== 'radio' && e.target.type !== 'checkbox') {
        const previousValue = e.target.dataset.previousValue || '';
        trackAnswerChange(e.target, previousValue, e.target.value);
        e.target.dataset.previousValue = e.target.value;
      }
    };

    const handleRadioCheckboxChange = (e) => {
      if ((e.target.type === 'radio' || e.target.type === 'checkbox') &&
          (e.target.name === 'answer' || e.target.name?.startsWith('answer-'))) {
        const previousValue = e.target.dataset.previousValue || '';
        trackAnswerChange(e.target, previousValue, e.target.value);
        e.target.dataset.previousValue = e.target.value;
      }
    };

    // Only add event listeners if answer change tracking is enabled
    document.addEventListener('input', handleTextInput);
    document.addEventListener('change', handleRadioCheckboxChange);
  }

  // Mouse click tracking - only initialize if enabled
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

    const trackClick = (e) => {
      mouseClickEvents.push({
        timestamp: Date.now(),
        button: e.button === 0 ? 'left' : e.button === 2 ? 'right' : 'middle',
        x: e.clientX,
        y: e.clientY,
        target: e.target.tagName + (e.target.id ? '#' + e.target.id : '')
      });
    };

    const throttledTrackClick = throttle(trackClick, 100); // Max 10 per second

    // Only add event listeners if mouse click tracking is enabled
    document.addEventListener('click', throttledTrackClick);
    document.addEventListener('contextmenu', throttledTrackClick);
  }

  // Keyboard tracking - only initialize if enabled
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

    const trackKeypress = (e) => {
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
        keyType: keyType,
        key: e.key // Record the actual key pressed
      });
    };

    const throttledTrackKeypress = throttle(trackKeypress, 100); // Max 10 per second

    // Only add event listener if keyboard tracking is enabled
    document.addEventListener('keydown', throttledTrackKeypress);
  }

  // Time to first interaction - only initialize if enabled
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

    // Only add event listeners if time to first interaction tracking is enabled
    document.addEventListener('click', recordFirstInteraction);
    document.addEventListener('keydown', recordFirstInteraction);
    document.addEventListener('input', recordFirstInteraction);
  }

  // Device fingerprint
  if (shouldTrack.deviceFingerprint) {
    // Comprehensive device fingerprinting
    const getComprehensiveFingerprint = async () => {
      const fingerprint = {};

      // Basic system info with modern API support
      fingerprint.os = navigator.userAgentData?.platform || navigator.platform || 'unknown';
      fingerprint.browser = navigator.userAgentData?.brands?.[0]?.brand ||
                           navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/)?.[0] || 'Unknown';
      fingerprint.screenResolution = `${screen.width}x${screen.height}`;
      fingerprint.colorDepth = screen.colorDepth;
      fingerprint.deviceMemory = browserSupport.deviceMemory ? (navigator.deviceMemory || 'unknown') : 'unsupported';
      fingerprint.hardwareConcurrency = browserSupport.hardwareConcurrency ? (navigator.hardwareConcurrency || 'unknown') : 'unsupported';
      fingerprint.timezone = browserSupport.intl ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'unsupported';
      fingerprint.language = navigator.language;
      fingerprint.platform = navigator.userAgentData?.platform || navigator.platform || 'unknown';
      fingerprint.cookieEnabled = navigator.cookieEnabled;

      // Canvas fingerprint
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Device fingerprint test 🔒', 2, 2);
        fingerprint.canvasFingerprint = canvas.toDataURL().substring(0, 100);
      } catch (e) {
        fingerprint.canvasFingerprint = 'unavailable';
      }

      // WebGL fingerprint
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
          fingerprint.webglVendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'unknown';
          fingerprint.webglRenderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : 'unknown';
          fingerprint.gpu = fingerprint.webglRenderer;
        } else {
          fingerprint.webglVendor = 'unavailable';
          fingerprint.webglRenderer = 'unavailable';
          fingerprint.gpu = 'unavailable';
        }
      } catch (e) {
        fingerprint.webglVendor = 'error';
        fingerprint.webglRenderer = 'error';
        fingerprint.gpu = 'error';
      }

      // Audio context fingerprint with browser compatibility
      if (browserSupport.audioContext) {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          const audioContext = new AudioContextClass();
          const oscillator = audioContext.createOscillator();
          const analyser = audioContext.createAnalyser();
          const gainNode = audioContext.createGain();

          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);

          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          oscillator.connect(analyser);
          analyser.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.start(0);

          // Use a timeout to allow audio processing
          setTimeout(() => {
            const audioData = new Float32Array(analyser.frequencyBinCount);
            analyser.getFloatFrequencyData(audioData);

            let audioFingerprint = 0;
            for (let i = 0; i < audioData.length; i++) {
              audioFingerprint += Math.abs(audioData[i]);
            }

            fingerprint.audioFingerprint = audioFingerprint.toString();

            oscillator.stop();
            audioContext.close();
          }, 100);
        } catch (error) {
          fingerprint.audioFingerprint = 'error';
        }
      } else {
        fingerprint.audioFingerprint = 'unsupported';
      }

      // Available fonts detection
      try {
        const baseFonts = ['monospace', 'sans-serif', 'serif'];
        const testFonts = [
          'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
          'Calibri', 'Cambria', 'Comic Sans MS', 'Consolas', 'Courier',
          'Courier New', 'Georgia', 'Helvetica', 'Impact', 'Lucida Console',
          'Lucida Sans Unicode', 'Microsoft Sans Serif', 'MS Gothic',
          'MS PGothic', 'MS Sans Serif', 'MS Serif', 'Palatino Linotype',
          'Segoe UI', 'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS',
          'Verdana', 'Wingdings'
        ];

        const testString = 'mmmmmmmmmmlli';
        const testSize = '72px';
        const h = document.getElementsByTagName('body')[0];

        const s = document.createElement('span');
        s.style.fontSize = testSize;
        s.innerHTML = testString;
        const defaultWidths = {};
        const defaultHeights = {};

        for (let i = 0; i < baseFonts.length; i++) {
          s.style.fontFamily = baseFonts[i];
          h.appendChild(s);
          defaultWidths[baseFonts[i]] = s.offsetWidth;
          defaultHeights[baseFonts[i]] = s.offsetHeight;
          h.removeChild(s);
        }

        const availableFonts = [];
        for (let i = 0; i < testFonts.length; i++) {
          let detected = false;
          for (let j = 0; j < baseFonts.length; j++) {
            s.style.fontFamily = testFonts[i] + ',' + baseFonts[j];
            h.appendChild(s);
            const matched = (s.offsetWidth !== defaultWidths[baseFonts[j]] ||
                           s.offsetHeight !== defaultHeights[baseFonts[j]]);
            h.removeChild(s);
            detected = detected || matched;
          }
          if (detected) {
            availableFonts.push(testFonts[i]);
          }
        }

        fingerprint.fonts = availableFonts;
      } catch (e) {
        fingerprint.fonts = ['detection_failed'];
      }

      return fingerprint;
    };

    // Get comprehensive fingerprint
    getComprehensiveFingerprint().then(fp => {
      deviceFingerprint = fp;
    }).catch(() => {
      // Fallback to basic fingerprint with modern API support
      deviceFingerprint = {
        os: navigator.userAgentData?.platform || navigator.platform || 'unknown',
        browser: navigator.userAgentData?.brands?.[0]?.brand ||
                navigator.userAgent.match(/(Chrome|Firefox|Safari|Edge)\/[\d.]+/)?.[0] || 'Unknown',
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        deviceMemory: browserSupport.deviceMemory ? (navigator.deviceMemory || 'unknown') : 'unsupported',
        hardwareConcurrency: browserSupport.hardwareConcurrency ? (navigator.hardwareConcurrency || 'unknown') : 'unsupported',
        timezone: browserSupport.intl ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'unsupported',
        language: navigator.language,
        platform: navigator.userAgentData?.platform || navigator.platform || 'unknown',
        error: 'comprehensive_fingerprinting_failed'
      };
    });
  }

  // Original tracking variables (backward compatibility)
  let inactiveTime = 0;
  let copyCount = 0;
  let pasteCount = 0;
  let rightClickCount = 0;

  // Original event tracking (keep for backward compatibility)
  const handleVisibilityChangeInactive = () => {
    if (document.hidden) {
      lastActiveTime = Date.now();
    } else {
      inactiveTime += Date.now() - lastActiveTime;
    }
  };

  // Always track inactive time for backward compatibility
  document.addEventListener('visibilitychange', handleVisibilityChangeInactive);

  // Only track legacy clipboard events if clipboard tracking is enabled
  if (shouldTrack.clipboard) {
    const handleLegacyCopy = () => copyCount++;
    const handleLegacyPaste = () => pasteCount++;

    document.addEventListener('copy', handleLegacyCopy);
    document.addEventListener('paste', handleLegacyPaste);
  }

  // Only track right-click if mouse tracking is enabled
  if (shouldTrack.mouseClicks) {
    const handleLegacyRightClick = () => rightClickCount++;
    document.addEventListener('contextmenu', handleLegacyRightClick);
  }

  // Form submission
  document.getElementById('answerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get submit button and set loading state
    const submitButton = document.getElementById('submitButton');
    const originalButtonText = submitButton.textContent;

    // Disable button and show loading state
    submitButton.disabled = true;
    submitButton.innerHTML = 'Submitting...';
    submitButton.classList.add('loading');

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
      // Re-enable button and restore original state
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
      submitButton.classList.remove('loading');

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

    // Build payload with only enabled metrics
    const payload = {
      test_id: testId,
      question_id: questionId,
      profile_id: userId,
      answer,
      time_taken: Math.round(timeTaken/1000),
      ip: ip,

      // Original metrics (always included for backward compatibility)
      copy_count: copyCount,
      paste_count: pasteCount,
      right_click_count: rightClickCount,
      inactive_time: Math.round(inactiveTime / 1000),

      // Timestamps
      start_time: new Date(startTime).toISOString(),
      submit_time: new Date().toISOString(),

      // Device type is always included
      device_type: deviceType
    };

    if (shouldTrack.focusEvents) {
      // Update the final duration before submitting
      if (focusEvents.length > 0) {
        focusEvents[focusEvents.length - 1].duration_ms = Date.now() - focusStateStart;
      }
      payload.focus_events = limitArray(focusEvents);
    }

    if (shouldTrack.clipboard) {
      payload.clipboard_events = limitArray(clipboardEvents);
    }

    if (shouldTrack.preSubmitDelay) {
      payload.pre_submit_delay = preSubmitDelay;
    }

    if (shouldTrack.answerChanges) {
      payload.answer_change_events = limitArray(answerChangeEvents);
    }

    if (shouldTrack.deviceFingerprint) {
      payload.device_fingerprint = deviceFingerprint;
    }

    if (shouldTrack.timeToFirstInteraction) {
      payload.time_to_first_interaction = firstInteractionTime ? firstInteractionTime / 1000 : 0;
    }

    if (shouldTrack.mouseClicks) {
      payload.mouse_click_events = limitArray(mouseClickEvents);
    }

    if (shouldTrack.keyboardPresses) {
      payload.keyboard_press_events = limitArray(keyboardPressEvents);
    }

    const resultSalt = document.querySelector('input[name="result_salt"]')?.value;
    const encryptionKey = userId + resultSalt;

    // Encryption logic
    const encryptPayload = (payload, key) => {
      const text = JSON.stringify(payload);
      const textBytes = new TextEncoder().encode(text);
      const keyBytes = new TextEncoder().encode(key);

      const encryptedBytes = textBytes.map((byte, i) => byte ^ keyBytes[i % keyBytes.length]);
      const encryptedStr = String.fromCharCode(...encryptedBytes);
      
      return btoa(encryptedStr);
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
      // Re-enable button and restore original state on error
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
      submitButton.classList.remove('loading');

      console.error('Error:', error);
      alert('An error occurred. Please try again.');
    }
  });
};

startScript();
