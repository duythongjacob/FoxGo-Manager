# Thanh thông số (giờ, thời tiết, giá)

> Mã: `FD-002` · PRD: [PRD-003](../prd/003-thanh-thong-so.md) (dịch vụ ngoài anh duyệt 14/11/2026) · Cập nhật: 15/11/2026 · Trạng thái: Đang chạy

## Mục đích
Thông tin nhìn nhanh mỗi lần mở trình duyệt: giờ, lời chào, thời tiết 3 ngày, giá vàng thế giới quy đổi, USD/VND, Bitcoin,
giá xăng RON95 Petrolimex.
Chỉ để tham khảo.

## Cách dùng / hành vi
- **Thu nhỏ** (mặc định): dải hẹp chỉ có giờ + nhiệt độ + biểu tượng thời tiết + nút "Giới thiệu".
- **Mở rộng** (bấm nút menu): giờ lớn, thứ/ngày + lời chào; thời tiết hiện tại + ô chọn thành phố + dự báo 3 ngày;
  4 dòng giá: Vàng (đ/lượng, % 24h), USD (đ), Bitcoin (USD, % 24h), Xăng RON95 (đ/lít vùng 1, "kỳ dd/mm";
  rê chuột → tên mặt hàng, giá vùng 2, nguồn). Mỗi lần mở trang luôn ở dạng thu nhỏ (không nhớ lựa chọn mở).
- Ô chọn thành phố: 21 thành phố lớn VN, gõ tìm không dấu ("ha noi" → Hà Nội).
- Rê chuột lên thanh: tooltip ghi **nguồn** + giờ cập nhật giá.
- Trạng thái:
  - Đang tải: khung xám nhấp nháy (`dk-skel`).
  - Lỗi và chưa có bản lưu: "Chưa tải được…".
  - Mất mạng nhưng có bản lưu: hiện bản lưu (có thể cũ).
- Màn < 1080px: ngăn kéo trượt từ trái, bấm nền mờ để đóng.

## Quy tắc nghiệp vụ
- Lời chào: < 5h "Khuya rồi" · < 11h sáng · < 13h trưa · < 18h chiều · còn lại tối.
- Vàng: giá PAX Gold (USD/oz) × tỷ giá USD/VND × **1,20565 oz/lượng** (1 lượng = 37,5 g).
  Chưa có tỷ giá → dùng giá VND của CoinGecko. **Chưa gồm chênh lệch vàng miếng trong nước** (ghi trong tooltip).
- Xăng: RON 95-III / "Mức 3" (phổ thông); không có thì RON 95 bất kỳ trừ loại V / Mức 5. File snapshot hỏng → ẩn dòng xăng.
- Số gọn: ≥ 1 tỷ → "1.90 tỷ"; ≥ 1 triệu → "122.9 tr".
- % thay đổi |v| ≤ 0,005% → không tô màu tăng/giảm.
- Ngày dự báo: "Hôm nay" / "Mai" / "T2"… theo giờ máy.

## Dữ liệu
| Dữ liệu | Lưu ở đâu | Khóa | Ghi chú |
|---|---|---|---|
| Thời tiết | localStorage (đệm) | `foxdots.ext.weather:<lat>,<lon>` | 30 phút |
| Giá Bitcoin, PAX Gold | localStorage (đệm) | `foxdots.ext.market` | 10 phút; lỗi → thử lại sau 1 phút |
| USD/VND | localStorage (đệm) | `foxdots.ext.usdvnd` | 6 giờ |
| Giá xăng Petrolimex | bundle `src/data/fuel.json` | — | snapshot, tạo bằng `npm run fuel:update` trước khi deploy |
| Thành phố đã chọn | localStorage | `foxdots.city` | tên trong `VN_CITIES`, mặc định Hà Nội |

Dịch vụ ngoài (anh duyệt 14/11/2026, chỉ GET, không key, không cookie/referrer, không dữ liệu cá nhân):
- Open-Meteo `api.open-meteo.com/v1/forecast`: gửi tọa độ thành phố. Giấy phép CC BY 4.0, bắt buộc ghi nguồn.
- CoinGecko `api.coingecko.com/api/v3/simple/price`: ids `bitcoin`, `pax-gold`. Gói miễn phí hay trả lỗi 429.
- ExchangeRate-API `open.er-api.com/v6/latest/USD`: bắt buộc ghi nguồn.
- Giá xăng (anh yêu cầu 15/11/2026, giống Fox.TàiChính FF-075): **trình duyệt không gọi** — chỉ máy anh chạy
  `npm run fuel:update` (GET trang công khai `giaxanghomnay.com`, bảng Petrolimex) → `src/data/fuel.json` đóng gói cùng trang.
  Giá đổi theo kỳ điều hành (thường thứ Năm) → chạy trước mỗi lần deploy.

Luồng đệm chi tiết: [../LUONG_CODE.md](../LUONG_CODE.md) mục 4.

## Mã nguồn
| File | Vai trò |
|---|---|
| `src/features/launcher/InfoDock.tsx` | Giao diện thanh, vòng làm mới 10 phút, trạng thái tải/lỗi, chọn thành phố |
| `src/data/external.ts` | Gọi 3 API, đệm `cached()`, hẹn giờ 8 s, đọc/ghi thành phố |
| `src/lib/weather.ts` (+ test) | Mã WMO → mô tả/biểu tượng, `VN_CITIES`, `parseOpenMeteo`, `dayLabel` |
| `src/lib/market.ts` (+ test) | `parseCoinGecko`, `parseUsdVnd`, `goldPerLuong`, `compactVnd`, `pct`, `usd` |
| `src/lib/fuel.ts` (+ test) | `isFuelPrices`, `pickRon95`, `fuelDateLabel` |
| `src/data/fuel.json` | Snapshot giá xăng dầu Petrolimex (vùng 1/2) |
| `scripts/fuel-update.mjs`, `fuel-parse.mjs` | Lấy bảng giá từ giaxanghomnay.com → fuel.json (chép từ Fox.TàiChính) |
| `src/lib/greeting.ts` (+ test) | `greeting`, `formatDate`, `formatTime` |
| `src/components/WxIcon.tsx` | Biểu tượng thời tiết SVG (ngày/đêm) |
| `src/features/launcher/launcher.css` | Kiểu `.dk-*`: dải, ngăn kéo, khung chờ |

## Kiểm thử
- Tự động: `weather.test.ts`, `market.test.ts`, `greeting.test.ts`, `fuel.test.ts` (tách bảng giaxanghomnay, chọn RON95, snapshot hợp lệ) (phân tích phản hồi hợp lệ/thiếu/sai, quy đổi, định dạng).
- Tay:
  - Tắt mạng (DevTools → Offline) khi đã có đệm → vẫn hiện số.
  - Xóa `foxdots.ext.*` + Offline → hiện "Chưa tải được".
  - Đổi thành phố → thời tiết đổi, tải lại trang vẫn nhớ.

## Giới hạn & việc còn lại
- Giá vàng là giá thế giới quy đổi, không phải giá SJC/vàng miếng.
- Giá xăng chỉ mới khi chạy `npm run fuel:update` rồi deploy lại (không tự cập nhật trên trang).
- Chỉ thành phố trong danh sách (không tìm địa danh — cần duyệt dịch vụ mới).

## Lịch sử
| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 15/11/2026 | chưa phát hành | Bản đầu (chép logic thời tiết/giá từ Fox.TàiChính FF-033/034/036) |
| 15/11/2026 | chưa phát hành | Luôn thu nhỏ khi mở trang; bỏ khóa nhớ `foxdots.dock` |
| 17/11/2026 | chưa phát hành | FD-014: kiểm cấu trúc đệm `foxdots.ext.*` khi đọc (đệm hỏng / thời điểm ở tương lai → bỏ, tải lại) |
| 15/11/2026 | chưa phát hành | Thêm dòng Xăng RON95 (snapshot Petrolimex, `npm run fuel:update`) |
