# Cài đặt trang chủ (thứ tự ô, tab mới, link riêng)

> Mã: `FD-005` · PRD: [PRD-004](../prd/004-cai-dat-trang-chu.md) · Cập nhật: 17/11/2026 · Trạng thái: Đang chạy

## Mục đích
Cho mỗi người tự sắp trang chủ theo thói quen: app/link hay dùng lên đầu, mở trong tab mới, thêm link ngoài hệ Fox
(mail, YouTube…) thành ô ngay cạnh các app.

## Cách dùng / hành vi
- Nút **Cài đặt** (bánh răng) ở cuối thanh thông số, ngay trên "Giới thiệu". Có ở cả dạng thu nhỏ (chỉ icon) lẫn mở rộng.
- Bấm vào → popup "Cài đặt trang chủ" (đầu popup: icon + tiêu đề + "Chỉ lưu trên trình duyệt này"; nội dung chia nhóm có nhãn, mỗi nhóm một khung viền):
  - **Giao diện → Chế độ màu**: Hệ thống / Sáng / Tối (khóa `foxdots.theme`, dùng chung với nút trên trang Giới thiệu).
  - **Giao diện → Hiệu ứng line**: Bình thường / Chậm (vẽ + xung sáng chậm 2,5 lần) / Tắt (ẩn hẳn line logo → ô app;
    khoảng cách logo–ô app giữ nguyên để trang không nhảy).
  - **Mở trong tab mới** (công tắc): bật → mọi ô app/link mở tab mới (`target="_blank"`, `rel="noopener noreferrer"`).
  - **Ô trên trang chủ** (đếm số ô): mỗi dòng có số thứ tự, tên + mô tả ngắn (app) / mô tả hoặc địa chỉ (link),
    nút lên/xuống (không icon, không nhãn trạng thái); link có thêm nút xóa (app thì không xóa được).
  - **Thêm link riêng** (đếm x/24): tên (không bắt buộc, tối đa 24 ký tự) + mô tả (không bắt buộc, tối đa 32 ký tự)
    + link → "Thêm" hoặc Enter. Bỏ trống tên → lấy theo tên miền
    (`youtube.com` → "youtube"). Link sai → báo đỏ dưới ô.
  - **Khôi phục mặc định**: trả thứ tự về mặc định, tắt tab mới, giao diện về "Hệ thống", line về "Bình thường"; **giữ** các link đã thêm.
  - **Hủy** / dấu X / bấm nền: bỏ mọi thay đổi. **Lưu thay đổi** (chỉ bật khi có thay đổi): áp dụng ngay + ghi vào máy.
- Ô link trên trang chủ: cùng kiểu chữ với ô app (tên + mô tả, không có mô tả thì tên miền; gạch chân cam FD khi rê chuột); rê chuột thấy địa chỉ.
- Màn 375px: popup gần full màn, ô "Tên" và "Mô tả" mỗi ô một dòng, ẩn số thứ tự, nút Hủy/Lưu chia đôi hàng dưới. Popup theo giao diện sáng/tối đang chọn.

## Quy tắc nghiệp vụ
- Thứ tự mặc định: app theo `sortApps` (mở được theo thứ tự khai báo → kế hoạch), sau đó link theo lúc thêm.
- Đã lưu thứ tự: ô có trong danh sách đã lưu đứng trước đúng thứ tự đó; ô mới (app mới thêm vào `apps.ts`) xếp cuối.
- Link chỉ nhận `http`/`https` (chặn `javascript:`, `data:`… vì gắn thẳng vào `<a>`); thiếu giao thức → thêm `https://`;
  tên miền phải có dấu chấm (trừ `localhost`).
- Tối đa 24 link (dữ liệu sửa tay quá giới hạn bị cắt khi đọc).

## Dữ liệu
| Dữ liệu | Lưu ở đâu | Khóa | Ghi chú |
|---|---|---|---|
| Chế độ giao diện | localStorage | `foxdots.theme` | xem [giao-dien-sang-toi.md](giao-dien-sang-toi.md) |
| Thiết lập trang chủ | localStorage | `foxdots.prefs` | `{ order: string[], newTab: boolean, links: {id,name,url,desc?}[], lineFx: 'normal'|'slow'|'off' }` (thiếu/lạ → `normal`); `order` gồm `app:<mã>` / `link:<id>` |

Chỉ trên máy này — không đồng bộ, không gửi đi đâu. Không tải favicon của link (sẽ phải gọi dịch vụ ngoài).

## Mã nguồn
| File | Vai trò |
|---|---|
| `src/features/launcher/SettingsModal.tsx` | Popup, bản nháp, thêm/xóa/sắp xếp |
| `src/features/launcher/tiles.ts` | Kiểu `Tile` (app \| link), `tilesOf`, `tileKey`, `tileName` |
| `src/features/launcher/LauncherPage.tsx` | Giữ thiết lập, vẽ `AppTile` / `LinkTile` |
| `src/features/launcher/InfoDock.tsx` | Nút Cài đặt (`onSettings`) |
| `src/lib/prefs.ts` (+ test) | `parsePrefs` (cả `lineFx`), `normalizeUrl`, `nameFromUrl`, `applyOrder`, `move` |
| `src/data/prefs.ts` | `readPrefs` / `savePrefs` (localStorage) |
| `src/features/launcher/launcher.css` | `.dk-settings`, `.lc-tile.is-link`, `.st-*` |

## Kiểm thử
- Tự động: `prefs.test.ts` — chuẩn hóa link (chặn `javascript:`), dữ liệu hỏng/trùng/quá giới hạn, sắp thứ tự, đổi chỗ.
- Tay (đã chạy 15/11/2026 bằng Edge headless): thêm `youtube.com` → đưa lên đầu → bật tab mới → Lưu → tải lại trang:
  ô youtube đứng đầu, `target=_blank`; popup ở 375px.
- Còn nên thử: giao diện sáng; Hủy sau khi sửa → không đổi gì.

## Giới hạn & việc còn lại
- Chưa kéo-thả (dùng nút lên/xuống — dễ dùng bằng bàn phím/điện thoại).
- Chưa ẩn app, chưa sửa tên link đã thêm (xóa rồi thêm lại).
- Phím tắt `/` để tìm (phần còn lại của FD-005) chưa làm.

## Lịch sử
| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 15/11/2026 | chưa phát hành | Bản đầu: tab mới, thứ tự ô, thêm/xóa link |
| 16/11/2026 | chưa phát hành | Làm lại giao diện popup (nhóm có nhãn, nhãn trạng thái, Lưu chỉ bật khi có thay đổi), thêm mục Giao diện |
| 16/11/2026 | chưa phát hành | Danh sách ô bỏ icon và nhãn trạng thái; thêm link có trường Mô tả |
| 17/11/2026 | chưa phát hành | Thêm Giao diện → Hiệu ứng line (Bình thường / Chậm / Tắt) |
