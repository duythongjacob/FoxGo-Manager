/**
 * Ô trên trang chủ = app Fox hoặc link người dùng thêm (FD-005). Gộp hai loại + sắp theo thiết lập — dùng chung cho
 * LauncherPage và SettingsModal. Tính năng: docs/features/cai-dat.md.
 */
import type { FoxApp } from '@/lib/apps'
import { appKey, applyOrder, linkKey, type Prefs, type UserLink } from '@/lib/prefs'

export type Tile = { kind: 'app'; app: FoxApp } | { kind: 'link'; link: UserLink }

/** Khóa thứ tự của ô (khớp `Prefs.order`). */
export const tileKey = (t: Tile) => (t.kind === 'app' ? appKey(t.app.code) : linkKey(t.link.id))

/** Tên hiển thị: "Fox.TàiChính" → "Tài Chính"; link → tên người dùng đặt. */
export const tileName = (t: Tile) =>
  t.kind === 'app' ? t.app.name.replace('Fox.', '').replace(/(\p{Ll})(\p{Lu})/gu, '$1 $2') : t.link.name

/** Mọi ô theo thứ tự hiển thị: mặc định app (đã sortApps) rồi tới link; có `order` đã lưu thì theo order. */
export function tilesOf(apps: readonly FoxApp[], prefs: Prefs): Tile[] {
  const all: Tile[] = [
    ...apps.map((app) => ({ kind: 'app' as const, app })),
    ...prefs.links.map((link) => ({ kind: 'link' as const, link })),
  ]
  return applyOrder(all, tileKey, prefs.order)
}
