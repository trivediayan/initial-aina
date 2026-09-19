import type { ExplorationRecord, AchievementProgress, Badge } from '@/types/exploration.types'
import { ACHIEVEMENT_DEFS } from '@/types/exploration.types'
import { supabase } from '@/lib/supabase'

const STORAGE_KEY = (userId: string) => `aayna_explored_${userId}`

class ExplorationService {
  private getRecords(userId: string): ExplorationRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY(userId))
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  }

  private saveRecords(userId: string, records: ExplorationRecord[]): void {
    try {
      localStorage.setItem(STORAGE_KEY(userId), JSON.stringify(records))
    } catch (e) {
      console.error('Failed to save exploration records:', e)
    }
  }

  async syncFromRemote(userId: string): Promise<void> {
    if (!supabase) return
    try {
      const { data, error } = await supabase
        .from('explorations')
        .select('place_id, place_name, category, explored_at')
        .eq('user_id', userId)

      if (error || !data) return

      const remote: ExplorationRecord[] = data.map((row) => ({
        placeId: row.place_id,
        placeName: row.place_name,
        category: row.category,
        exploredAt: row.explored_at,
      }))

      const local = this.getRecords(userId)
      const merged = new Map<string, ExplorationRecord>()
      for (const record of [...remote, ...local]) {
        merged.set(record.placeId, record)
      }
      this.saveRecords(userId, Array.from(merged.values()))
    } catch {
      /* table may not exist yet — local storage remains source of truth */
    }
  }

  markExplored(
    userId: string,
    placeId: string,
    placeName: string,
    category: string,
  ): boolean {
    const records = this.getRecords(userId)
    const alreadyExplored = records.some((r) => r.placeId === placeId)
    if (alreadyExplored) return false

    const record: ExplorationRecord = {
      placeId,
      placeName,
      category,
      exploredAt: new Date().toISOString(),
    }
    records.push(record)
    this.saveRecords(userId, records)

    if (supabase) {
      void supabase.from('explorations').upsert({
        user_id: userId,
        place_id: placeId,
        place_name: placeName,
        category,
        explored_at: record.exploredAt,
      }, { onConflict: 'user_id,place_id' })
    }

    return true
  }

  isExplored(userId: string, placeId: string): boolean {
    return this.getRecords(userId).some((r) => r.placeId === placeId)
  }

  getAllExplored(userId: string): ExplorationRecord[] {
    return this.getRecords(userId).sort(
      (a, b) => new Date(b.exploredAt).getTime() - new Date(a.exploredAt).getTime(),
    )
  }

  getExploredCount(userId: string, category?: string): number {
    const records = this.getRecords(userId)
    if (!category) return records.length
    return records.filter((r) => r.category === category).length
  }

  getAchievements(userId: string): AchievementProgress[] {
    const records = this.getRecords(userId)

    return ACHIEVEMENT_DEFS.map((def) => {
      const current = def.category === null
        ? records.length
        : records.filter((r) => r.category === def.category).length

      const isUnlocked = current >= def.required
      let unlockedAt: string | undefined
      if (isUnlocked) {
        const relevant = def.category === null
          ? records
          : records.filter((r) => r.category === def.category)
        const sorted = [...relevant].sort(
          (a, b) => new Date(a.exploredAt).getTime() - new Date(b.exploredAt).getTime(),
        )
        unlockedAt = sorted[def.required - 1]?.exploredAt
      }

      return { def, current: Math.min(current, def.required), isUnlocked, unlockedAt }
    })
  }

  getBadges(userId: string): Badge[] {
    return this.getAchievements(userId)
      .filter((a) => a.isUnlocked)
      .map((a) => ({
        id: a.def.id,
        title: a.def.title,
        icon: a.def.icon,
        color: a.def.badgeColor,
        bg: a.def.badgeBg,
        unlockedAt: a.unlockedAt || new Date().toISOString(),
      }))
  }

  getStats(userId: string) {
    return {
      total: this.getExploredCount(userId),
      heritage: this.getExploredCount(userId, 'heritage'),
      spiritual: this.getExploredCount(userId, 'spiritual'),
      art: this.getExploredCount(userId, 'art'),
      food: this.getExploredCount(userId, 'food'),
      hidden: this.getExploredCount(userId, 'hidden'),
      architecture: this.getExploredCount(userId, 'architecture'),
    }
  }
}

export const explorationService = new ExplorationService()
