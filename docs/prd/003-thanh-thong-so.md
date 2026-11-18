# PRD-003: Thanh thông số (giờ, thời tiết, giá)

| | |
|---|---|
| Mã | FD-002 (thanh thông số trên trang chủ FoxGo_Manager) |
| Trạng thái | Đã duyệt (viết bù, anh duyệt 17/11/2026). Đã phát hành (≤ v0.4.0); dịch vụ ngoài anh duyệt 14/11/2026, giá xăng 15/11/2026 |
| Người duyệt | Anh (Product Owner) |
| Ngày | 2026-11-17 |

> PRD viết bù. Hành vi chi tiết: [`../features/thanh-thong-so.md`](../features/thanh-thong-so.md); luồng đệm:
> [`../LUONG_CODE.md`](../LUONG_CODE.md) mục 4. Trang chủ chứa thanh: PRD-002.

## 1. Vấn đề
Mỗi sáng anh mở nhiều trang để xem giờ, thời tiết, giá vàng, USD, Bitcoin, giá xăng. Trang chủ là chỗ mở nhiều nhất →
gom các thông tin nhìn nhanh đó về một dải bên trái, không làm rối phần ô app.

## 2. Mục tiêu & chỉ số thành công
- Nhìn giờ + nhiệt độ ngay khi mở trang (dạng thu nhỏ), bấm 1 lần thấy đủ giá — đo bằng: không cần mở trang khác.
- Không gửi dữ liệu cá nhân ra ngoài; chỉ dùng dịch vụ anh đã duyệt, có ghi nguồn.
- Mất mạng vẫn hiện số gần nhất (đệm), không treo trang.

## 3. Phạm vi
**Trong phạm vi:**
- Dạng **thu nhỏ** (mặc định, mỗi lần mở trang): giờ, nhiệt độ + biểu tượng, nút Cài đặt, "Giới thiệu".
- Dạng **mở rộng**: giờ lớn, thứ/ngày, lời chào; thời tiết hiện tại + chọn thành phố (21 thành phố VN, gõ không dấu)
  + dự báo 3 ngày; 4 dòng giá: Vàng (đ/lượng, % 24h), USD/VND, Bitcoin (USD, % 24h), Xăng RON95 (vùng 1, kỳ dd/mm).
- Tooltip ghi nguồn + giờ cập nhật (bắt buộc theo giấy phép Open-Meteo, ExchangeRate-API).
- ≥ 1080px cố định trái; < 1080px ngăn kéo + nền mờ.
- Đang mở → bấm ra ngoài thanh hoặc nhấn Esc thì tự thu lại, mọi cỡ màn (anh yêu cầu 18/11/2026, v0.7.4).

**Ngoài phạm vi:**
- Giá vàng SJC/vàng miếng trong nước (không có nguồn miễn phí được duyệt).
- Tìm địa danh tùy ý (cần dịch vụ geocoding — phải hỏi anh).
- Giá xăng tự cập nhật trên trang (trình duyệt không gọi trang giá xăng).
- Biểu đồ giá, cảnh báo giá, tỷ giá khác USD.

## 4. User stories
- Là anh, tôi muốn mở trình duyệt là thấy giờ và nhiệt độ mà không phải bấm gì.
- Là anh, tôi muốn xem giá vàng, USD, Bitcoin, xăng trong một chỗ để nắm thị trường mỗi sáng.
- Là anh, tôi muốn chọn thành phố mình đang ở và được nhớ lần sau.
- Là anh, tôi muốn biết số liệu lấy từ đâu và cập nhật lúc nào để không hiểu nhầm.
- Là anh khi mất mạng, tôi vẫn muốn thấy số gần nhất thay vì trang lỗi.

## 5. Yêu cầu chi tiết & thiết kế

### 5.1 Dịch vụ ngoài (chỉ trong `src/data/external.ts`, chỉ GET, không key, không cookie/referrer)
| Dịch vụ | Dùng cho | Gửi đi | Đệm | Duyệt |
|---|---|---|---|---|
| Open-Meteo | Thời tiết 3 ngày | Tọa độ thành phố chọn từ danh sách | 30 phút | 14/11/2026 |
| CoinGecko | Bitcoin, PAX Gold | `bitcoin`, `pax-gold` | 10 phút (lỗi → thử lại 1 phút) | 14/11/2026 |
| ExchangeRate-API | USD/VND | — | 6 giờ | 14/11/2026 |
| giaxanghomnay.com | Giá xăng Petrolimex | **Chỉ từ máy anh** qua `npm run fuel:update` → `src/data/fuel.json` | snapshot trong bundle | 15/11/2026 |

Hẹn giờ mỗi lệnh gọi 8 s; vòng làm mới 10 phút khi trang mở.

### 5.2 Quy tắc
- Lời chào: < 5h "Khuya rồi" · < 11h sáng · < 13h trưa · < 18h chiều · còn lại tối.
- Vàng = PAX Gold (USD/oz) × USD/VND × 1,20565 oz/lượng; chưa có tỷ giá → giá VND của CoinGecko. Tooltip ghi
  "chưa gồm chênh lệch vàng miếng trong nước".
- Xăng: RON 95-III / "Mức 3"; không có → RON 95 bất kỳ trừ V/Mức 5; file hỏng → ẩn dòng xăng.
- Số gọn: ≥ 1 tỷ "1.90 tỷ", ≥ 1 triệu "122.9 tr"; |% thay đổi| ≤ 0,005% không tô màu.
- Trạng thái: đang tải = khung xám nhấp nháy; lỗi + chưa có đệm = "Chưa tải được…"; lỗi + có đệm = hiện đệm.

### 5.3 Dữ liệu (localStorage, chỉ trên máy)
`foxdots.ext.weather:<lat>,<lon>`, `foxdots.ext.market`, `foxdots.ext.usdvnd` (đệm), `foxdots.city` (thành phố,
mặc định Hà Nội). Không lưu gì về người dùng ngoài thành phố đã chọn.

## 6. Tiêu chí nghiệm thu
- [ ] Mở trang → thanh thu nhỏ có giờ + nhiệt độ; bấm menu → đủ thời tiết 3 ngày + 4 dòng giá.
- [ ] Đổi thành phố ("ha noi" tìm ra Hà Nội) → thời tiết đổi; tải lại vẫn nhớ.
- [ ] Rê chuột → tooltip có nguồn Open-Meteo, CoinGecko, ExchangeRate-API, Petrolimex + giờ cập nhật.
- [ ] DevTools Offline khi đã có đệm → vẫn hiện số; xóa `foxdots.ext.*` + Offline → "Chưa tải được…", trang không treo.
- [ ] Network: chỉ gọi 3 tên miền đã duyệt; không gọi giaxanghomnay.com từ trình duyệt.
- [ ] < 1080px: ngăn kéo trượt, bấm nền mờ đóng; 375px không tràn.
- [ ] Mọi cỡ màn: bấm ra ngoài thanh / Esc → thu lại; bấm trong thanh hoặc popup chọn thành phố → vẫn mở.
- [ ] `npm run check` sạch (test `weather`, `market`, `greeting`, `fuel`).

## 7. Rủi ro & bảo mật
- **Gửi dữ liệu ra ngoài** → chỉ tọa độ thành phố trong danh sách cố định (không vị trí GPS); mọi lệnh gọi ở một file.
- **Dịch vụ miễn phí lỗi / 429** (CoinGecko hay bị) → đệm + thử lại 1 phút, hiện bản cũ.
- **Hiểu nhầm giá** → ghi rõ "giá thế giới quy đổi", kỳ giá xăng, giờ cập nhật; chỉ để tham khảo, không khuyến nghị mua bán.
- **Giá xăng cũ** nếu quên `fuel:update` → ghi trong quy trình deploy (`CLAUDE.md`, `docs/QUY_TRINH.md`).
- **Giấy phép** → bắt buộc ghi nguồn (CC BY 4.0 Open-Meteo, ExchangeRate-API).

## 8. Kế hoạch release
- Đã phát hành (v0.2.0 → v0.4.0). Mỗi lần deploy: `npm run fuel:update` trước `npm run deploy`.
- Thêm dịch vụ/nguồn mới → hỏi anh, cập nhật bảng §5.1 + `CLAUDE.md`.
- Hoàn tác: Firebase Hosting Rollback hoặc build lại từ tag trước.
