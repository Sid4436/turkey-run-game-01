// Keyboard and mouse input, turned into game actions. Actions are edge-triggered presses
// (jump, dash, hide, pause, mute, confirm) plus one held state (duck), so the game logic
// never needs to know which key or button the player used.

const KEY_ACTIONS = {
  Space: 'jump', ArrowUp: 'jump', KeyW: 'jump',
  ArrowDown: 'duck', KeyS: 'duck',
  ShiftLeft: 'dash', ShiftRight: 'dash', KeyD: 'dash',
  KeyE: 'hide',
  KeyP: 'pause', Escape: 'pause',
  KeyM: 'mute',
  Enter: 'confirm',
};

export function createInput(canvas) {
  const pressed = new Set();
  const held = new Set();
  let pointer = { x: 0, y: 0, clicked: false };

  const toCanvas = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  window.addEventListener('keydown', (event) => {
    const action = KEY_ACTIONS[event.code];
    if (!action) return;
    event.preventDefault();
    if (!event.repeat) pressed.add(action);
    held.add(action);
    if (action === 'jump' || action === 'confirm') pressed.add('start');
  });
  window.addEventListener('keyup', (event) => {
    const action = KEY_ACTIONS[event.code];
    if (action) held.delete(action);
  });

  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  canvas.addEventListener('mousedown', (event) => {
    event.preventDefault();
    const at = toCanvas(event);
    pointer = { ...at, clicked: true };
    if (event.button === 2) {
      held.add('duck');
    } else {
      pressed.add('jump');
      held.add('jump');
      pressed.add('start');
    }
  });
  window.addEventListener('mouseup', (event) => {
    if (event.button === 2) held.delete('duck');
    else held.delete('jump');
  });
  canvas.addEventListener('mousemove', (event) => {
    const at = toCanvas(event);
    pointer.x = at.x;
    pointer.y = at.y;
  });
  window.addEventListener('blur', () => held.clear());

  return {
    took(action) {
      const had = pressed.has(action);
      pressed.delete(action);
      return had;
    },
    isHeld: (action) => held.has(action),
    pointer: () => pointer,
    consumeClick() {
      const was = pointer.clicked;
      pointer.clicked = false;
      return was ? { x: pointer.x, y: pointer.y } : null;
    },
    endFrame() {
      pressed.clear();
      pointer.clicked = false;
    },
  };
}
