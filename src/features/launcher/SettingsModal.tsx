/**
 * Popup "Cài đặt trang chủ" (FD-005) — mở từ nút Cài đặt trên thanh thông số. Xem docs/features/cai-dat.md.
 * Sửa trên bản nháp; chỉ khi bấm "Lưu" mới áp dụng + ghi localStorage (Hủy = bỏ hết thay đổi).
 */
import { useState } from 'react'
import { Button, Input, Modal, Switch, Typography } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
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
import { tileKey, tileName, tilesOf, type Tile } from './tiles'
import type { FoxApp } from '@/lib/apps'

/** id ngắn cho link mới — chỉ cần không trùng trong máy này. */
const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)

/** Ảnh nhỏ đầu dòng: linh vật của app hoặc chữ cái đầu của link. */
function TileIcon({ tile }: { tile: Tile }) {
  return tile.kind === 'app' ? (
    <img className="st-ico" src={tile.app.mascot} alt="" width={28} height={28} />
  ) : (
    <span className="st-ico is-letter" aria-hidden>
      {tile.link.name.charAt(0).toUpperCase()}
    </span>
  )
}

interface Props {
  open: boolean
  prefs: Prefs
  /** App đã sắp mặc định (sortApps) */
  apps: FoxApp[]
  onSave: (p: Prefs) => void
  onClose: () => void
}

/** Nội dung popup — tách riêng để mỗi lần mở dựng lại từ đầu (bản nháp lấy theo thiết lập hiện tại). */
function SettingsBody({ prefs, apps, onSave, onClose }: Omit<Props, 'open'>) {
  const [newTab, setNewTab] = useState(prefs.newTab)
  const [links, setLinks] = useState<UserLink[]>(prefs.links)
  // Bản nháp thứ tự = thứ tự đang hiện trên trang chủ (đủ mọi ô, kể cả app mới chưa có trong order đã lưu)
  const [order, setOrder] = useState<string[]>(() => tilesOf(apps, prefs).map(tileKey))
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [err, setErr] = useState<string | null>(null)

  const tiles = tilesOf(apps, { order, newTab, links })

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
    setNewTab(DEFAULT_PREFS.newTab)
    // Giữ link anh đã thêm, chỉ trả thứ tự về mặc định (app trước, link sau theo lúc thêm)
    setOrder(tilesOf(apps, { ...DEFAULT_PREFS, links }).map(tileKey))
  }

  return (
    <>
      <div className="st-sec">
        <div className="st-row">
          <span>
            <b>Mở trong tab mới</b>
            <Typography.Text type="secondary" className="st-hint">
              Bấm ô app/link sẽ mở tab mới, trang chủ vẫn giữ nguyên
            </Typography.Text>
          </span>
          <Switch checked={newTab} onChange={setNewTab} aria-label="Mở trong tab mới" />
        </div>
      </div>

      <div className="st-sec">
        <b className="st-title">Thứ tự ô</b>
        <ol className="st-list">
          {tiles.map((t, i) => (
            <li key={tileKey(t)} className="st-item">
              <TileIcon tile={t} />
              <span className="st-name">
                {tileName(t)}
                {t.kind === 'link' && <em>{t.link.url}</em>}
              </span>
              <Button
                size="small"
                type="text"
                icon={<ArrowUpOutlined />}
                disabled={i === 0}
                onClick={() => setOrder(move(tiles.map(tileKey), i, -1))}
                aria-label={`Đưa ${tileName(t)} lên`}
              />
              <Button
                size="small"
                type="text"
                icon={<ArrowDownOutlined />}
                disabled={i === tiles.length - 1}
                onClick={() => setOrder(move(tiles.map(tileKey), i, 1))}
                aria-label={`Đưa ${tileName(t)} xuống`}
              />
              {t.kind === 'link' ? (
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => removeLink(t.link.id)}
                  aria-label={`Xóa link ${t.link.name}`}
                />
              ) : (
                <span className="st-gap" aria-hidden />
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className="st-sec">
        <b className="st-title">Thêm link</b>
        <div className="st-add">
          <Input
            placeholder="Tên (không bắt buộc)"
            value={name}
            maxLength={MAX_NAME}
            onChange={(e) => setName(e.target.value)}
            aria-label="Tên link"
          />
          <Input
            placeholder="Link, VD: youtube.com"
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
        {err && (
          <Typography.Text type="danger" className="st-hint" role="alert">
            {err}
          </Typography.Text>
        )}
      </div>

      <div className="st-foot">
        <Button type="link" onClick={reset} className="st-reset">
          Khôi phục mặc định
        </Button>
        <Button onClick={onClose}>Hủy</Button>
        <Button type="primary" onClick={() => onSave({ order, newTab, links })}>
          Lưu
        </Button>
      </div>
    </>
  )
}

/** Popup cài đặt trang chủ: mở tab mới, sắp xếp ô, thêm/xóa link. Thiết lập chỉ lưu trên máy này. */
export default function SettingsModal({ open, ...rest }: Props) {
  return (
    <Modal
      open={open}
      onCancel={rest.onClose}
      title="Cài đặt trang chủ"
      footer={null}
      destroyOnHidden
      width={460}
    >
      <SettingsBody {...rest} />
    </Modal>
  )
}
