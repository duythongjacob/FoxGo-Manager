# Thanh thông số (giờ, thời tiết, giá)

> Mã: `FD-002` · PRD: — (dịch vụ ngoài anh duyệt 14/11/2026) · Cập nhật: 15/11/2026 · Trạng thái: Đang chạy

## Mục đích
Thông tin nhìn nhanh mỗi lần mở trình duyệt: giờ, lời chào, thời tiết 3 ngày, giá vàng thế giới quy đổi, USD/VND, Bitcoin.
Chỉ để tham khảo.

## Cách dùng / hành vi
- **Thu nhỏ** (mặc định): dải hẹp chỉ có giờ + nhiệt độ + biểu tượng thời tiết + nút "Giới thiệu".
- **Mở rộng** (bấm nút menu): giờ lớn, thứ/ngày + lời chào; thời tiết hiện tại + ô chọn thành phố + dự báo 3 ngày;
  3 dòng giá: Vàng (đ/lượng, % 24h), USD (đ), Bitcoin (USD, % 24h). Lựa chọn thu/mở được nhớ trên máy.
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
- Số gọn: ≥ 1 tỷ → "1.90 tỷ"; ≥ 1 triệu → "122.9 tr".
- % thay đổi |v| ≤ 0,005% → không tô màu tăng/giảm.
- Ngày dự báo: "Hôm nay" / "Mai" / "T2"… theo giờ máy.

## Dữ liệu
| Dữ liệu | Lưu ở đâu | Khóa | Ghi chú |
|---|---|---|---|
| Thời tiết | localStorage (đệm) | `foxdots.ext.weather:<lat>,<lon>` | 30 phút |
| Giá Bitcoin, PAX Gold | localStorage (đệm) | `foxdots.ext.market` | 10 phút; lỗi → thử lại sau 1 phút |
| USD/VND | localStorage (đệm) | `foxdots.ext.usdvnd` | 6 giờ |
| Thành phố đã chọn | localStorage | `foxdots.city` | tên trong `VN_CITIES`, mặc định Hà Nội |

Dịch vụ ngoài (anh duyệt 14/11/2026, chỉ GET, không key, không cookie/referrer, không dữ liệu cá nhân):
- Open-Meteo `api.open-meteo.com/v1/forecast`: gửi tọa độ thành phố. Giấy phép CC BY 4.0, bắt buộc ghi nguồn.
- CoinGecko `api.coingecko.com/api/v3/simple/price`: ids `bitcoin`, `pax-gold`. Gói miễn phí hay trả lỗi 429.
- ExchangeRate-API `open.er-api.com/v6/latest/USD`: bắt buộc ghi nguồn.

Luồng đệm chi tiết: [../LUONG_CODE.md](../LUONG_CODE.md) mục 4.

## Mã nguồn
| File | Vai trò |
|---|---|
| `src/features/launcher/InfoDock.tsx` | Giao diện thanh, vòng làm mới 10 phút, trạng thái tải/lỗi, chọn thành phố |
| `src/data/external.ts` | Gọi 3 API, đệm `cached()`, hẹn giờ 8 s, đọc/ghi thành phố |
| `src/lib/weather.ts` (+ test) | Mã WMO → mô tả/biểu tượng, `VN_CITIES`, `parseOpenMeteo`, `dayLabel` |
| `src/lib/market.ts` (+ test) | `parseCoinGecko`, `parseUsdVnd`, `goldPerLuong`, `compactVnd`, `pct`, `usd` |
| `src/lib/greeting.ts` (+ test) | `greeting`, `formatDate`, `formatTime` |
| `src/components/WxIcon.tsx` | Biểu tượng thời tiết SVG (ngày/đêm) |
| `src/features/launcher/launcher.css` | Kiểu `.dk-*`: dải, ngăn kéo, khung chờ |

## Kiểm thử
- Tự động: `weather.test.ts`, `market.test.ts`, `greeting.test.ts` (phân tích phản hồi hợp lệ/thiếu/sai, quy đổi, định dạng).
- Tay:
  - Tắt mạng (DevTools → Offline) khi đã có đệm → vẫn hiện số.
  - Xóa `foxdots.ext.*` + Offline → hiện "Chưa tải được".
  - Đổi thành phố → thời tiết đổi, tải lại trang vẫn nhớ.

## Giới hạn & việc còn lại
- Giá vàng là giá thế giới quy đổi, không phải giá SJC/vàng miếng.
- Chỉ thành phố trong danh sách (không tìm địa danh — cần duyệt dịch vụ mới).

## Lịch sử
| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 15/11/2026 | chưa phát hành | Bản đầu (chép logic thời tiết/giá từ Fox.TàiChính FF-033/034/036) |
