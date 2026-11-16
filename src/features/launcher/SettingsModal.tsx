/**
 * Popup "Cài đặt trang chủ" (FD-005) — mở từ nút Cài đặt trên thanh thông số. Xem docs/features/cai-dat.md.
 * Sửa trên bản nháp; chỉ khi bấm "Lưu thay đổi" mới áp dụng + ghi localStorage (Hủy = bỏ hết thay đổi).
 * Gồm: giao diện (sáng/tối/theo hệ thống), mở tab mới, thứ tự ô, thêm link riêng.
 */
import { useState, type CSSProperties, type ReactNode } from 'react'
import { Button, Input, Modal, Segmented, Switch, Tooltip, Typography } from 'antd'
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  DesktopOutlined,
  MoonOutlined,
  PlusOutlined,
  SettingOutlined,
  SunOutlined,
  UndoOutlined,
} from '@ant-design/icons'
import { STATUS_LABEL, type FoxApp } from '@/lib/apps'
import {
  DEFAULT_PREFS,
  linkKey,
  MAX_LINKS,
  MAX_NAME,
  move,
  nameFromUrl,
  normalizeUrl,
  type Prefs,
  type UserLink,
} from '@/lib/prefs'
import type { ThemeMode } from '@/lib/theme'
import { tileKey, tileName, tilesOf, type Tile } from './tiles'

/** id ngắn cho link mới — chỉ cần không trùng trong máy này. */
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

/** Chế độ giao diện mặc định khi "Khôi phục mặc định". */
const DEFAULT_MODE: ThemeMode = 'system'

const MODE_OPTIONS = [
  { value: 'system', label: 'Hệ thống', icon: <DesktopOutlined /> },
  { value: 'light', label: 'Sáng', icon: <SunOutlined /> },
  { value: 'dark', label: 'Tối', icon: <MoonOutlined /> },
]

/** Ảnh nhỏ đầu dòng: linh vật của app hoặc chữ cái đầu của link. */
function TileIcon({ tile }: { tile: Tile }) {
  return tile.kind === 'app' ? (
    <span className="st-ico" style={{ '--app-accent': tile.app.accent } as CSSProperties} aria-hidden>
      <img src={tile.app.mascot} alt="" width={24} height={24} />
    </span>
  ) : (
    <span className="st-ico is-letter" aria-hidden>
      {tile.link.name.charAt(0).toUpperCase()}
    </span>
  )
}

/** Một nhóm cài đặt: nhãn nhỏ phía trên + khung viền chứa nội dung. */
function Section({ label, extra, children }: { label: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <section className="st-sec">
      <header className="st-sec-head">
        <h3>{label}</h3>
        {extra}
      </header>
      <div className="st-card">{children}</div>
    </section>
  )
}

/** Một dòng thiết lập: tên + mô tả bên trái, điều khiển bên phải. */
function Row({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <div className="st-row">
      <span className="st-row-text">
        <b>{title}</b>
        <span>{desc}</span>
      </span>
      {children}
    </div>
  )
}

interface Props {
  open: boolean
  prefs: Prefs
  /** Chế độ giao diện đang chọn */
  mode: ThemeMode
  /** App đã sắp mặc định (sortApps) */
  apps: FoxApp[]
  onSave: (p: Prefs, mode: ThemeMode) => void
  onClose: () => void
}

/** Nội dung popup — tách riêng để mỗi lần mở dựng lại từ đầu (bản nháp lấy theo thiết lập hiện tại). */
function SettingsBody({ prefs, mode: savedMode, apps, onSave, onClose }: Omit<Props, 'open'>) {
  const [mode, setMode] = useState<ThemeMode>(savedMode)
  const [newTab, setNewTab] = useState(prefs.newTab)
  const [links, setLinks] = useState<UserLink[]>(prefs.links)
  // Bản nháp thứ tự = thứ tự đang hiện trên trang chủ (đủ mọi ô, kể cả app mới chưa có trong order đã lưu)
  const [initialOrder] = useState<string[]>(() => tilesOf(apps, prefs).map(tileKey))
  const [order, setOrder] = useState<string[]>(initialOrder)
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const tiles = tilesOf(apps, { order, newTab, links })
  const dirty =
    mode !== savedMode ||
    newTab !== prefs.newTab ||
    JSON.stringify(links) !== JSON.stringify(prefs.links) ||
    order.join() !== initialOrder.join()

  const addLink = () => {
    const u = normalizeUrl(url)
    if (!u) return setErr('Link chưa đúng — VD: youtube.com hoặc https://mail.google.com')
    if (links.length >= MAX_LINKS) return setErr(`Tối đa ${MAX_LINKS} link`)
    const link = { id: newId(), name: (name.trim() || nameFromUrl(u)).slice(0, MAX_NAME), url: u }
    setLinks([...links, link])
    setOrder([...order, linkKey(link.id)])
    setName('')
    setUrl('')
    setErr(null)
  }

  const removeLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id))
    setOrder(order.filter((k) => k !== linkKey(id)))
  }

  const reset = () => {
    setMode(DEFAULT_MODE)
    setNewTab(DEFAULT_PREFS.newTab)
    // Giữ link đã thêm, chỉ trả thứ tự về mặc định (app trước, link sau theo lúc thêm)
    setOrder(tilesOf(apps, { ...DEFAULT_PREFS, links }).map(tileKey))
  }

  return (
    <>
      <div className="st-body">
        <Section label="Giao diện">
          <Row title="Chế độ màu" desc="Tối nền xanh đậm, sáng nền trắng">
            <Segmented
              size="middle"
              value={mode}
              options={MODE_OPTIONS}
              onChange={(v) => setMode(v as ThemeMode)}
              aria-label="Chế độ màu"
            />
          </Row>
        </Section>

        <Section label="Khi mở ứng dụng">
          <Row title="Mở trong tab mới" desc="Trang chủ vẫn giữ nguyên ở tab này">
            <Switch checked={newTab} onChange={setNewTab} aria-label="Mở trong tab mới" />
          </Row>
        </Section>

        <Section label="Ô trên trang chủ" extra={<span className="st-count">{tiles.length} ô</span>}>
          <ol className="st-list">
            {tiles.map((t, i) => {
              const n = tileName(t)
              return (
                <li key={tileKey(t)} className="st-item">
                  <span className="st-idx" aria-hidden>
                    {i + 1}
                  </span>
                  <TileIcon tile={t} />
                  <span className="st-name">
                    <b>{n}</b>
                    <em>
                      {t.kind === 'link'
                        ? t.link.url.replace(/^https?:\/\//, '')
                        : (t.app.tagline ?? t.app.name)}
                    </em>
                  </span>
                  <span className={`st-chip${t.kind === 'link' ? ' is-link' : ''}`}>
                    {t.kind === 'link' ? 'Link' : STATUS_LABEL[t.app.status]}
                  </span>
                  <span className="st-actions">
                    <Button
                      size="small"
                      type="text"
                      icon={<ArrowUpOutlined />}
                      disabled={i === 0}
                      onClick={() => setOrder(move(tiles.map(tileKey), i, -1))}
                      aria-label={`Đưa ${n} lên`}
                    />
                    <Button
                      size="small"
                      type="text"
                      icon={<ArrowDownOutlined />}
                      disabled={i === tiles.length - 1}
                      onClick={() => setOrder(move(tiles.map(tileKey), i, 1))}
                      aria-label={`Đưa ${n} xuống`}
                    />
                    {t.kind === 'link' ? (
                      <Tooltip title="Xóa link">
                        <Button
                          size="small"
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => removeLink(t.link.id)}
                          aria-label={`Xóa link ${t.link.name}`}
                        />
                      </Tooltip>
                    ) : (
                      <span className="st-gap" aria-hidden />
                    )}
                  </span>
                </li>
              )
            })}
          </ol>
        </Section>

        <Section
          label="Thêm link riêng"
          extra={
            <span className="st-count">
              {links.length}/{MAX_LINKS}
            </span>
          }
        >
          <div className="st-form">
            <div className="st-add">
              <Input
                placeholder="Tên (không bắt buộc)"
                value={name}
                maxLength={MAX_NAME}
                onChange={(e) => setName(e.target.value)}
                aria-label="Tên link"
              />
              <Input
                placeholder="Địa chỉ, VD: youtube.com"
                value={url}
                status={err ? 'error' : undefined}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setErr(null)
                }}
                onPressEnter={addLink}
                aria-label="Địa chỉ link"
              />
              <Button icon={<PlusOutlined />} onClick={addLink} disabled={!url.trim()}>
                Thêm
              </Button>
            </div>
            {err ? (
              <Typography.Text type="danger" className="st-hint" role="alert">
                {err}
              </Typography.Text>
            ) : (
              <span className="st-hint">Link mới xếp cuối danh sách — đổi chỗ ở mục bên trên.</span>
            )}
          </div>
        </Section>
      </div>

      <footer className="st-foot">
        <Button type="text" icon={<UndoOutlined />} onClick={reset} className="st-reset">
          Khôi phục mặc định
        </Button>
        <Button onClick={onClose}>Hủy</Button>
        <Button type="primary" disabled={!dirty} onClick={() => onSave({ order, newTab, links }, mode)}>
          Lưu thay đổi
        </Button>
      </footer>
    </>
  )
}

/** Popup cài đặt trang chủ: giao diện, mở tab mới, sắp xếp ô, thêm/xóa link. Thiết lập chỉ lưu trên máy này. */
export default function SettingsModal({ open, ...rest }: Props) {
  return (
    <Modal
      open={open}
      onCancel={rest.onClose}
      title={
        <div className="st-title">
          <span className="st-title-ico" aria-hidden>
            <SettingOutlined />
          </span>
          <span>
            Cài đặt trang chủ
            <small>Chỉ lưu trên trình duyệt này</small>
          </span>
        </div>
      }
      footer={null}
      destroyOnHidden
      width={560}
      className="st-modal"
      centered
    >
      <SettingsBody {...rest} />
    </Modal>
  )
}
