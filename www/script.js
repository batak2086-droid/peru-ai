const form = document.getElementById('chatForm');
const input = document.getElementById('message');
const chat = document.getElementById('chat');
const clearBtn = document.getElementById('clearBtn');
const suggestions = document.querySelectorAll('.suggestion');
const sendBtn = document.getElementById('sendBtn');

const systemPrompt = `Tum PERU AI ho. Tumhari ek hi bhasha Roman Hinglish hai.
Har jawab sirf Roman Hinglish mein do.
Hindi ke shabd English letters mein likho.
Devanagari script aur sirf English mein jawab dena mana hai.
Jawab simple, natural aur aam taur par 1-2 sentences ka rakho.
User ki baat samjho aur seedha jawab do.
User udaas ho to pyaar se aur samajhdari se baat karo.
Tum ek AI assistant ho, insaan hone ka daawa mat karo.
Har jawab bhejne se pehle check karo ki woh poora Roman Hinglish mein hai.
Agar jawab Roman Hinglish mein nahi hai, to use Roman Hinglish mein dobara likho.`;

const history = [];

function addMessage(text, role) {
  const bubble = document.createElement('div');
  bubble.className = 'message ' + role;
  bubble.textContent = text;
  chat.appendChild(bubble);
  chat.scrollTop = chat.scrollHeight;
  return bubble;
}

async function sendMessage(text) {
  text = text.trim();
  if (!text || sendBtn.disabled) return;

  addMessage(text, 'user');
  history.push({ role: 'user', content: text });
  input.value = '';
  input.style.height = 'auto';
  sendBtn.disabled = true;

  const waiting = addMessage('Peru soch raha hai... ✨', 'assistant');

  try {
    const response = await fetch('http://127.0.0.1:8081/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: systemPrompt },
          ...history
        ],
        temperature: 0.7,
        max_tokens: 100,
        stream: false
      })
    });

    if (!response.ok) throw new Error('AI server error: ' + response.status);

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim();

    if (!answer) throw new Error('AI ne empty reply diya.');

    waiting.textContent = answer;
    history.push({ role: 'assistant', content: answer });
  } catch (error) {
    waiting.textContent = 'AI se connection nahi ho paaya. Dono servers chalu hain, ye check karo. ❤️';
    console.error(error);
  } finally {
    sendBtn.disabled = false;
    input.focus();
  }
}

form.addEventListener('submit', event => {
  event.preventDefault();
  sendMessage(input.value);
});

input.addEventListener('keydown', event => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

input.addEventListener('input', () => {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 120) + 'px';
});

suggestions.forEach(button => {
  button.addEventListener('click', () => {
    input.value = button.textContent.replace(/^[✦⌘]\s*/, '').trim();
    input.focus();
  });
});

clearBtn.addEventListener('click', () => {
  chat.replaceChildren();
  history.length = 0;
  input.value = '';
  input.focus();
});
