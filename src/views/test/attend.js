const startScript = () => {
  const startTime = Date.now();
  let inactiveTime = 0;
  let lastActiveTime = startTime;
  let copyCount = 0;
  let pasteCount = 0;
  let rightClickCount = 0;
  let ip = '';

  fetch("https://api.ipify.org")
    .then(res => res.text())
    .then((res) => {
        ip = res
    });

  // This is to make sure the images within the question dont overflow the question div.
  document.addEventListener('DOMContentLoaded', function() {
    const questionDiv = document.getElementById('question-div');
    const children = questionDiv.children;
    for (let child of children) {
      child.style.maxWidth = '100%';
      child.style.maxHeight = '100%';
    }
  });

  // Track inactive time
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      lastActiveTime = Date.now();
    } else {
      inactiveTime += Date.now() - lastActiveTime;
    }
  });

  // Track copy, paste, and right-click events
  document.addEventListener('copy', () => copyCount++);
  document.addEventListener('paste', () => pasteCount++);
  document.addEventListener('contextmenu', (e) => {
    rightClickCount++;
  });

  const disableSubmitButton = () => {
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = true;
    submitButton.style.opacity = '0.5';
    submitButton.style.cursor = 'not-allowed';
    submitButton.textContent = 'Submitting...';
  };

  const enableSubmitButton = () => {
    const submitButton = document.getElementById('submitButton');
    submitButton.disabled = false;
    submitButton.style.opacity = '1';
    submitButton.style.cursor = 'pointer';
    submitButton.textContent = 'Submit Answer';
  };

  const encryptPayload = (payload, key) => {
    const text = JSON.stringify(payload);
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return btoa(result);
  };

  const sendRequest = async (url, data) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'trc': navigator.userAgent
      },
      body: data
    };

    if (url.startsWith('https://localhost')) {
      options.agent = new https.Agent({ rejectUnauthorized: false });
    }

    return fetch(url, options);
  };

  document.getElementById('answerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    disableSubmitButton();

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
      enableSubmitButton();
      return;
    };

    const testId = document.querySelector('input[name="test_id"]')?.value;
    const questionId = document.querySelector('input[name="question_id"]')?.value;
    const userId = document.querySelector('input[name="user_id"]')?.value;

    const timeTaken = Date.now() - startTime;
    const payload = {
      test_id: testId,
      question_id: questionId,
      profile_id: userId,
      answer,
      time_taken: Math.round(timeTaken/1000),
      ip: ip,
      
      // if copy used - 1, not used 0
      // paste used - 1, not used 0
      // right click used - 1, not used - 0
      // so value will be from 0 to 3 max
      // we don't need total count
      // it will be like sum of true/false
      // where true=1 false =0
      // to know what he used
      copy_count: copyCount ? 1 : 0,
      paste_count: pasteCount ? 1 : 0,
      right_click_count: rightClickCount ? 1 : 0,
      inactive_time: Math.round(inactiveTime / 1000)
    };

    const resultSalt = document.querySelector('input[name="result_salt"]')?.value;
    const encryptionKey = userId + resultSalt;
    const encryptedPayload = encryptPayload(payload, encryptionKey);
    
    try {
      const response = await sendRequest(e.target.action, 'hashed_payload=' + encodeURIComponent(encryptedPayload));
      if (response.ok) {
        window.location.reload();
      } else {
        throw new Error('Server responded with an error');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
      enableSubmitButton();
    }
  });
};

startScript();