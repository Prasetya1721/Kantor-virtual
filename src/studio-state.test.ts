import { describe, expect, it } from 'vitest'
import { addContent, advanceContent, countDone, emptyState, loadState, nextStage, periodKey, QUOTA_PER_PERIOD, quotaStatus, removeContent, resetPeriod, rollPeriod, STUDIO_STAGES, type StudioState } from './studio-state.ts'

const monday = new Date('2026-10-12T08:00:00Z')
const friday = new Date('2026-10-16T08:00:00Z')

describe('periods', () => {
  it('keys periods by Monday of the week', () => {
    expect(periodKey(monday)).toBe('2026-10-12')
    expect(periodKey(friday)).toBe('2026-10-12')
    expect(periodKey(new Date('2026-10-18T08:00:00Z'))).toBe('2026-10-12')
    expect(periodKey(new Date('2026-10-19T08:00:00Z'))).toBe('2026-10-19')
  })

  it('rolls an old period into the archive when the week changes', () => {
    const state: StudioState = { period: { startedAt: '2026-10-05', contents: [ { id: 'a', title: 'x', product: 'p', stage: 'upload', createdAt: '', updatedAt: '' } ] }, archive: [] }
    const rolled = rollPeriod(state, friday)
    expect(rolled.period.startedAt).toBe('2026-10-12')
    expect(rolled.period.contents).toHaveLength(0)
    expect(rolled.archive[0].contents).toHaveLength(1)
  })

  it('keeps the period untouched within the same week', () => {
    const state = emptyState(monday)
    expect(rollPeriod(state, friday)).toBe(state)
  })

  it('resetPeriod archives the current contents and clears the quota', () => {
    let state = emptyState(monday)
    state = addContent(state, 'Konten 1', 'R50i', monday)
    const reset = resetPeriod(state)
    expect(reset.period.contents).toHaveLength(0)
    expect(reset.archive[0].contents).toHaveLength(1)
  })
})

describe('content pipeline', () => {
  it('adds content at the riset stage', () => {
    const state = addContent(emptyState(monday), '  Demo R50i  ', ' Anker R50i ', monday)
    expect(state.period.contents[0]).toMatchObject({ title: 'Demo R50i', product: 'Anker R50i', stage: 'riset' })
  })

  it('advances one stage at a time and never past upload', () => {
    let state = addContent(emptyState(monday), 'Demo', 'R50i', monday)
    const id = state.period.contents[0].id
    for (const expected of ['naskah', 'video', 'upload', 'upload']) {
      state = advanceContent(state, id, monday)
      expect(state.period.contents[0].stage).toBe(expected)
    }
    expect(nextStage('upload')).toBe('upload')
    expect(STUDIO_STAGES).toEqual(['riset', 'naskah', 'video', 'upload'])
  })

  it('counts only uploaded content towards the quota of five', () => {
    let state = emptyState(monday)
    for (let index = 0; index < QUOTA_PER_PERIOD; index += 1) state = addContent(state, `Konten ${index}`, 'R50i', monday)
    expect(quotaStatus(state.period).met).toBe(false)
    const ids = state.period.contents.map((content) => content.id)
    state = advanceContent(state, ids[0])
    state = advanceContent(state, ids[0])
    state = advanceContent(state, ids[0])
    expect(countDone(state.period)).toBe(1)
    expect(quotaStatus(state.period).met).toBe(false)
    let done = 0
    for (const id of ids.slice(1)) { for (let step = 0; step < 3; step += 1) state = advanceContent(state, id, monday); done += 1 }
    expect(countDone(state.period)).toBe(QUOTA_PER_PERIOD)
    expect(quotaStatus(state.period).met).toBe(true)
  })

  it('removes content by id', () => {
    let state = addContent(emptyState(monday), 'Hapus aku', 'R50i', monday)
    const id = state.period.contents[0].id
    state = removeContent(state, id)
    expect(state.period.contents).toHaveLength(0)
  })

  it('loadState falls back to a fresh state without storage', () => {
    // jsdom-less: window.localStorage may not exist; the function must not throw.
    expect(() => loadState()).not.toThrow()
  })
})
