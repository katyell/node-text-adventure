import { useReducer, useState, useRef, useEffect } from 'react';
import { gameReducer } from '../game/reducer.js';
import { createInitialState } from '../game/initialState.js';
import styles from './Terminal.module.css';

export function Terminal() {
  const [state, dispatch] = useReducer(
    gameReducer,
    undefined,
    createInitialState
  );
  const [input, setInput] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll output to bottom on every new line
  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.output]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [state.screen]);

  // Keep input focused
  const refocus = () => inputRef.current?.focus();

  const handleStart = (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    dispatch({ type: 'START_GAME' });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    dispatch({ type: 'COMMAND', payload: trimmed });
    setInput('');
  };

  return (
    <div className={styles.terminal} onClick={refocus}>
      {/* ── Output pane ── */}
      <div className={styles.output} ref={outputRef}>
        {state.screen === 'title' && (
          <div className={styles.titleScreen}>
            <p className={styles.kicker}>A Regency time-slip mystery</p>
            <h1 className={styles.title}>The Clockwork Cafe</h1>
            <pre className={styles.ascii}>{TITLE_CARD}</pre>
            <p className={styles.pressEnter}>PRESS ENTER TO BEGIN</p>
          </div>
        )}

        {state.output.map((line, i) => (
          <p
            key={i}
            className={
              line.type === 'input' ? styles.inputLine : styles.outputLine
            }
          >
            {line.type === 'input' ? `> ${line.text}` : line.text}
          </p>
        ))}
      </div>

      {/* ── Input bar ── */}
      <div className={styles.inputRow}>
        {state.screen === 'title' ? (
          <form onSubmit={handleStart} className={styles.inputForm}>
            <span className={styles.prompt}>&gt;</span>
            <input
              ref={inputRef}
              className={styles.input}
              aria-label='Start game'
              data-testid='start-input'
              autoFocus
              autoComplete='off'
              spellCheck={false}
              onChange={() => {}}
              value=''
            />
          </form>
        ) : (
          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <span className={styles.prompt}>&gt;</span>
            <input
              ref={inputRef}
              className={styles.input}
              aria-label='Command input'
              data-testid='command-input'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              autoComplete='off'
              spellCheck={false}
            />
          </form>
        )}
      </div>
    </div>
  );
}

const TITLE_CARD = `
┌────────────────────────┐
│ THE CLOCKWORK CAFE     │
│ LONDON, 1815           │
└────────────────────────┘
`;
