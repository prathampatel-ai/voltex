// ── DIALOGUE SYSTEM ─────────────────────────────────────────────────────────
// Manages dialogue queue and state. DialogueScene reads from this.

import { DIALOGUES, type DialogueBeat } from '../data/dialogues'

export class DialogueSystem {
  private queue: DialogueBeat[] = []
  private beatIndex = 0
  private pageIndex = 0
  private active = false
  private onComplete?: () => void

  get isActive() { return this.active }

  get currentBeat(): DialogueBeat | null {
    return this.queue[this.beatIndex] ?? null
  }

  get currentPage(): string {
    return this.currentBeat?.pages[this.pageIndex] ?? ''
  }

  get hasMore(): boolean {
    if (!this.currentBeat) return false
    if (this.pageIndex < this.currentBeat.pages.length - 1) return true
    return this.beatIndex < this.queue.length - 1
  }

  start(key: string, onComplete?: () => void) {
    const data = DIALOGUES[key]
    if (!data) { console.warn(`[Dialogue] Key not found: ${key}`); return }
    this.queue = [...data]
    this.beatIndex = 0
    this.pageIndex = 0
    this.active = true
    this.onComplete = onComplete
  }

  advance(): boolean {
    if (!this.active) return false

    const beat = this.currentBeat
    if (!beat) { this.close(); return false }

    // More pages in current beat?
    if (this.pageIndex < beat.pages.length - 1) {
      this.pageIndex++
      return true
    }

    // More beats?
    if (this.beatIndex < this.queue.length - 1) {
      this.beatIndex++
      this.pageIndex = 0
      return true
    }

    // Done
    this.close()
    return false
  }

  private close() {
    this.active = false
    this.queue = []
    this.beatIndex = 0
    this.pageIndex = 0
    this.onComplete?.()
  }
}

// Singleton — shared across scenes
export const dialogueSystem = new DialogueSystem()