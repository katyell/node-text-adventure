import { describe, it, expect } from 'vitest'
import { parseCommand } from './parser.js'

describe('parseCommand', () => {
  // ── Directions ──────────────────────────────────────────────────────────

  describe('directions', () => {
    it.each([
      ['NORTH', 'NORTH'],
      ['SOUTH', 'SOUTH'],
      ['EAST', 'EAST'],
      ['WEST', 'WEST'],
      ['UP', 'UP'],
      ['DOWN', 'DOWN'],
    ])('full word "%s" → verb %s', (input, expected) => {
      expect(parseCommand(input).verb).toBe(expected)
    })

    it.each([
      ['N', 'NORTH'],
      ['S', 'SOUTH'],
      ['E', 'EAST'],
      ['W', 'WEST'],
      ['U', 'UP'],
      ['D', 'DOWN'],
    ])('shorthand "%s" → verb %s', (input, expected) => {
      expect(parseCommand(input).verb).toBe(expected)
    })
  })

  // ── Single-word commands ─────────────────────────────────────────────────

  describe('single-word commands', () => {
    it.each([
      ['LOOK', 'LOOK'],
      ['L', 'LOOK'],
      ['INVENTORY', 'INVENTORY'],
      ['I', 'INVENTORY'],
      ['HELP', 'HELP'],
      ['H', 'HELP'],
      ['QUIT', 'QUIT'],
      ['ASSEMBLE', 'ASSEMBLE'],
    ])('"%s" → verb %s', (input, expected) => {
      expect(parseCommand(input).verb).toBe(expected)
    })
  })

  // ── EXAMINE ──────────────────────────────────────────────────────────────

  describe('EXAMINE', () => {
    it('parses EXAMINE <item>', () => {
      expect(parseCommand('EXAMINE book')).toEqual({ verb: 'EXAMINE', noun: 'book' })
    })

    it('parses X <item> shorthand', () => {
      expect(parseCommand('X coffee cup')).toEqual({ verb: 'EXAMINE', noun: 'coffee cup' })
    })

    it('lower-cases the noun', () => {
      expect(parseCommand('EXAMINE BOOK').noun).toBe('book')
    })

    it('handles multi-word item names', () => {
      expect(parseCommand('EXAMINE coffee cup').noun).toBe('coffee cup')
    })
  })

  // ── TAKE / DROP / WEAR ───────────────────────────────────────────────────

  describe('TAKE', () => {
    it('parses noun', () => {
      expect(parseCommand('TAKE book')).toEqual({ verb: 'TAKE', noun: 'book' })
    })

    it('handles multi-word item names', () => {
      expect(parseCommand('TAKE coffee cup').noun).toBe('coffee cup')
    })
  })

  describe('DROP', () => {
    it('parses noun', () => {
      expect(parseCommand('DROP book')).toEqual({ verb: 'DROP', noun: 'book' })
    })
  })

  describe('WEAR', () => {
    it('parses noun', () => {
      expect(parseCommand('WEAR jeans')).toEqual({ verb: 'WEAR', noun: 'jeans' })
    })
  })

  // ── TALK TO ──────────────────────────────────────────────────────────────

  describe('TALK TO', () => {
    it('parses npc name', () => {
      expect(parseCommand('TALK TO merchant')).toEqual({ verb: 'TALK_TO', noun: 'merchant' })
    })

    it('handles multi-word npc names', () => {
      expect(parseCommand('TALK TO old woman').noun).toBe('old woman')
    })
  })

  // ── SAY ──────────────────────────────────────────────────────────────────

  describe('SAY', () => {
    it('parses word', () => {
      expect(parseCommand('SAY clockwork')).toEqual({ verb: 'SAY', noun: 'clockwork' })
    })
  })

  // ── USE x WITH y ─────────────────────────────────────────────────────────

  describe('USE', () => {
    it('parses source and target', () => {
      expect(parseCommand('USE tshirt WITH coffee cup')).toEqual({
        verb: 'USE',
        source: 'tshirt',
        target: 'coffee cup',
      })
    })

    it('is case-insensitive', () => {
      const cmd = parseCommand('use Book with Coffee Cup')
      expect(cmd.verb).toBe('USE')
      expect(cmd.source).toBe('book')
      expect(cmd.target).toBe('coffee cup')
    })

    it('handles multi-word source and target', () => {
      const cmd = parseCommand('USE coffee cup WITH iron gates')
      expect(cmd.source).toBe('coffee cup')
      expect(cmd.target).toBe('iron gates')
    })

    it('returns UNKNOWN when WITH is missing', () => {
      expect(parseCommand('USE book').verb).toBe('UNKNOWN')
    })
  })

  // ── Whitespace / edge cases ───────────────────────────────────────────────

  describe('edge cases', () => {
    it('trims leading and trailing whitespace', () => {
      expect(parseCommand('  NORTH  ').verb).toBe('NORTH')
    })

    it('returns UNKNOWN for unrecognised input', () => {
      expect(parseCommand('DANCE').verb).toBe('UNKNOWN')
    })

    it('attaches the raw input on UNKNOWN', () => {
      expect(parseCommand('DANCE').raw).toBe('DANCE')
    })

    it('empty string returns UNKNOWN', () => {
      expect(parseCommand('').verb).toBe('UNKNOWN')
    })
  })
})
