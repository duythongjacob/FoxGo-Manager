# Test trình duyệt + đo tốc độ tải (e2e)

> Mã: `FD-014` · PRD: — (anh yêu cầu 17/11/2026: "test kỹ giao diện, tốc độ tải trang, thử lưu dữ liệu") · Cập nhật: 17/11/2026 · Trạng thái: Đang chạy

## Mục đích
Một lệnh mở mọi trang trên trình duyệt thật (máy tính + điện thoại, sáng + tối), bấm thử các thao tác chính, kiểm thiết
lập còn sau khi tải lại, và đo tốc độ tải bản build — để trang chủ (trang mở đầu trình duyệt) luôn nhanh và không vỡ.

## Cách dùng
```bash
npm run e2e          # test giao diện + thao tác + lưu dữ liệu (dev:test :5171, tự bật hoặc dùng server đang mở)
npm run e2e:perf     # đo tốc độ: build vào dist-perf/ + vite preview :4171, in bảng + so ngân sách
npm run e2e:report   # báo cáo HTML (ảnh chụp từng trang); bài đo tốc độ: npx playwright show-report playwright-report/perf
npm run e2e:ui       # chạy từng test, xem trực tiếp
npx playwright test e2e/persistence.spec.ts --project=dien-thoai   # một file / một khung
```
Lần đầu trên máy mới: `npx playwright install chromium`. Windows: chạy từ đường dẫn `C:\…` chữ hoa.

## Kiểm tra gì
| File | Nội dung |
|---|---|
| `e2e/layout.spec.ts` | 2 trang × sáng/tối (theo `prefers-color-scheme`) × 2 khung (máy tính 1366×900, Pixel 7): đúng `data-theme`, **không tràn ngang**, **tiêu đề không bị ép**, ô app không đè nhau, **không lỗi / cảnh báo console**, **không request tới host ngoài 3 dịch vụ được duyệt**. Trang Giới thiệu cuộn hết trang trước khi đo. Ảnh chụp cả trang đính vào báo cáo. Thêm: đường dẫn lạ → trang chủ; vào thẳng `#/gioi-thieu/tinh-nang` → cuộn đúng mục |
| `e2e/interactions.spec.ts` | Ô app đủ, đúng thứ tự (`sortApps`), `href` khớp `src/data/apps.ts`, app kế hoạch không bấm được; bấm ô → điều hướng đúng app; trang chủ không màn chờ, không nạp `motion`. Thanh thông số: mở/thu, số liệu mẫu (thời tiết, vàng quy đổi, USD, Bitcoin, xăng), dòng nguồn, chỉ gửi tọa độ thành phố; điện thoại bấm nền mờ thu lại; dịch vụ lỗi → "Chưa tải được"; tìm thành phố gõ không dấu. Cài đặt: Hủy không lưu, "Lưu thay đổi" chỉ bật khi có đổi, link `javascript:` / sai bị từ chối. Giới thiệu: màn chờ hiện rồi gỡ + mở khóa cuộn, nút sáng/tối xoay vòng + lưu, link chân trang đúng URL, "Mở trang chủ" |
| `e2e/persistence.spec.ts` | Đổi qua Cài đặt (tối, tắt line, tab mới, thêm link có mô tả, đưa link lên đầu) → tải lại: còn nguyên cả trên trang lẫn trong `foxdots.theme` / `foxdots.prefs`; xóa link + Khôi phục mặc định; thành phố nhớ sau tải lại và dùng đệm (không gọi mạng lại); mất mạng → dùng đệm cũ. Dữ liệu **trống / JSON hỏng / sai kiểu / mảng-số / link độc hại-quá dài-trùng id / đệm sai cấu trúc / localStorage bị chặn hẳn** → trang vẫn chạy, không lỗi console, lưu lại được dữ liệu sạch |
| `e2e/load.perf.ts` + `bundle.ts` | Bản build production. Mỗi trang đo 5 lần (xóa bộ đệm trước mỗi lần, bỏ 1 lần làm nóng), lấy trung vị: TTFB, DOMContentLoaded, load, FCP, LCP, **lúc hiện nội dung chính** (ô app / tiêu đề Hero và màn chờ đã gỡ), thời gian màn chờ, lần vào lại có bộ đệm, byte JS/CSS/font/ảnh. Điện thoại: CPU chậm 4× + 4G (40 ms, 9 Mbit/s). So **ngân sách** `BUDGET`; trang chủ không được tải `motion`. Bảng "File đã tải" + "tổng quan bundle": gzip/gốc từng chunk và gói chiếm nhiều nhất (đọc source map) — chunk > 100 kB gzip đánh dấu ⚠ |

## Quy tắc
- **Dịch vụ ngoài luôn bị chặn** (`stubNetwork` trong `helpers.ts`): Open-Meteo / CoinGecko / ExchangeRate-API trả dữ liệu
  mẫu cố định (hoặc lỗi / mất mạng theo test), mọi host khác bị hủy và ghi lại → test chạy được khi không có mạng,
  số liệu không đổi, và bắt được việc lỡ thêm CDN / analytics.
- Đo bằng vị trí / kích thước phần tử, **không so ảnh pixel**; ảnh chụp chỉ để người xem.
- Mỗi test một trình duyệt mới (localStorage trống). Dev server bật React StrictMode → effect chạy 2 lần lúc mở trang;
  test số lần gọi mạng cho phép ≤ 2 ở dev.
- Ngân sách tốc độ chặt nhưng chừa ~30–50% so với số đo lúc viết; vượt → xem gói nào nặng trước khi nới.

## Số đo lúc viết (17/11/2026, trung vị 5 lần, bản build trên máy)
| Trang | Khung | DCL | FCP | LCP | Hiện nội dung | Màn chờ | Vào lại | JS (nén) | Font |
|---|---|---|---|---|---|---|---|---|---|
| Trang chủ | máy tính | 44 ms | 244 ms | 244 ms | 79 ms | — | 65 ms | 225 kB | 166 kB |
| Trang chủ | điện thoại (CPU ÷4, 4G) | 392 ms | 756 ms | 756 ms | 540 ms | — | 500 ms | 225 kB | 166 kB |
| Giới thiệu | máy tính | 53 ms | 88 ms | 976 ms | 1463 ms | 1382 ms | 1462 ms | 279 kB | 193 kB |
| Giới thiệu | điện thoại (CPU ÷4, 4G) | 376 ms | 488 ms | 2224 ms | 2524 ms | 2050 ms | 2519 ms | 279 kB | 193 kB |

Bundle: `index-*.js` 225 kB gzip / 691 kB gốc (antd ~66%, react-dom ~19%, mã app ~5%) — chunk lớn nhất, tải ở mọi
trang; `LandingPage-*.js` 54 kB gzip (motion ~63%) — chỉ trang Giới thiệu (nạp lười đúng thiết kế).

## Dữ liệu
Không đọc / ghi dữ liệu thật; localStorage của trình duyệt test tạo mới mỗi test. Kết quả: `test-results/`,
`playwright-report/`, bản build đo tốc độ `dist-perf/` (không commit, `check:tree` bỏ qua). Phụ thuộc mới:
`@playwright/test` (devDependency, chỉ chạy trên máy, không vào bundle web) + Chromium tải về máy.

## Lỗi đã bắt được khi viết (17/11)
- Đệm `foxdots.ext.*` đúng JSON nhưng sai cấu trúc (hoặc thời điểm lưu ở tương lai → "còn hạn" mãi) làm thanh thông số
  ném lỗi khi vẽ → **trắng cả trang chủ** (không có error boundary). Sửa: `readCache` trong `src/data/external.ts` kiểm
  bằng `isWeather` / `isMarket` / `isUsdVnd` (lib, có test), sai thì bỏ đệm và tải lại.
- Cảnh báo antd `popupClassName` đã lỗi thời (ô chọn thành phố, `InfoDock.tsx`) → `classNames.popup.root`.

## Giới hạn & việc còn lại
- Chưa nối vào `npm run check` (cần trình duyệt + vài phút) — chạy trước khi release (`docs/BAO_TRI.md`).
- Số đo tốc độ là trên máy (preview cục bộ), không phải Firebase Hosting thật / mạng thật; dùng để so sánh giữa các lần.
- Chưa kiểm cỡ chữ lớn, chế độ "giảm chuyển động", trình duyệt Firefox / Safari.

## Lịch sử
| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 17/11/2026 | chưa phát hành | Bản đầu (theo mẫu FoxGo Work FW-044) |
