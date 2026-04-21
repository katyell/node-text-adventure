import { useReducer, useState, useRef, useEffect } from 'react'
import { gameReducer } from '../game/reducer.js'
import { createInitialState } from '../game/initialState.js'
import styles from './Terminal.module.css'

export function Terminal() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState)
  const [input, setInput] = useState('')
  const outputRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll output to bottom on every new line
  useEffect(() => {
    const el = outputRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [state.output])

  // Keep input focused
  const refocus = () => inputRef.current?.focus()

  const handleStart = () => dispatch({ type: 'START_GAME' })

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    dispatch({ type: 'COMMAND', payload: trimmed })
    setInput('')
  }

  return (
    <div className={styles.terminal} onClick={refocus}>
      {/* ── Output pane ── */}
      <div className={styles.output} ref={outputRef}>
        {state.screen === 'title' && (
          <div className={styles.titleScreen}>
            <pre className={styles.ascii}>{ASCII_TITLE}</pre>
            <p className={styles.pressEnter}>PRESS ENTER TO BEGIN</p>
          </div>
        )}

        {state.output.map((line, i) => (
          <p
            key={i}
            className={line.type === 'input' ? styles.inputLine : styles.outputLine}
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
              autoFocus
              autoComplete="off"
              spellCheck={false}
              onKeyDown={(e) => e.key === 'Enter' && handleStart()}
              onChange={() => {}}
              value=""
            />
          </form>
        ) : (
          <form onSubmit={handleSubmit} className={styles.inputForm}>
            <span className={styles.prompt}>&gt;</span>
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </form>
        )}
      </div>
    </div>
  )
}

const ASCII_TITLE = `
 _   _  ___  ____  _____   _____ _______  _______ _______
 \\\\  | |/ _ \\|  _ \\| ____| |_   _| ____\\ \\/ /_   _|_   _|
  \\\\ | | | | | | | |  _|     | | |  _|  \\  /  | |   | |
   \\\\| | |_| | |_| | |___    | | | |___ /  \\  | |   | |
    \\__|\\___/|____/|_____|   |_| |_____/_/\\_\\ |_|   |_|

     _  ______  _   _ _______ _    _  ____  ____
    /\\  |  _  \\| | | |  ____|| |  | |/ __ \\|  _ \\
   /  \\ | | | | | | | |__   | |  | | |  | | |_) |
  / /\\ \\| | | | | | |  __|  | |  | | |  | |  _ <
 / /  \\ \\ |_| \\ \\_/ / |____ | |__| | |__| | |_) |
/_/    \\_\\_____/\\___/|______||_____/ \\____/|____/
`
