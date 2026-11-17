# FoxGo Manager

Trang tổng hợp các app Fox — ghim làm trang chủ trình duyệt. Bản chạy: **https://foxgo.web.app**

Giờ, thời tiết, giá vàng / USD / Bitcoin và lối vào mọi app Fox trên một màn hình tối giản.
Chỉ chứa link và mô tả chung các app — **không đọc dữ liệu cá nhân**, không analytics, không quảng cáo.

## Chạy

```bash
npm install          # lần đầu
npm run dev          # http://localhost:5170   (hoặc bấm đúp ../start_manager.bat)
npm run dev:test     # http://localhost:5171   môi trường test
```

**Ghim làm trang chủ** (Chrome/Edge): Cài đặt → *Khi khởi động* → *Mở một trang cụ thể* → `https://foxgo.web.app`;
và *Giao diện* → *Hiện nút Trang chủ* → cùng địa chỉ.

## Tính năng

| Trang | Tính năng | Tài liệu |
|---|---|---|
| **Trang chủ** `#/` | Màn khóa tối giản: logo, ô app kính (rê chuột xem tính năng), app kế hoạch mờ | [trang-chu](docs/features/trang-chu.md) |
| | Thanh thông số: giờ + lời chào, thời tiết 3 ngày (21 thành phố), vàng đ/lượng, USD/VND, Bitcoin; thu/mở, ngăn kéo trên điện thoại | [thanh-thong-so](docs/features/thanh-thong-so.md) |
| **Giới thiệu** `#/gioi-thieu` | Hero, hệ sinh thái app, nguyên tắc, linh vật, lộ trình | [gioi-thieu](docs/features/gioi-thieu.md) |
| Chung | Danh sách app · điều hướng hash · sáng/tối theo hệ thống | [danh-sach-app](docs/features/danh-sach-app.md) · [dieu-huong](docs/features/dieu-huong.md) · [giao-dien-sang-toi](docs/features/giao-dien-sang-toi.md) |

Mục lục đầy đủ: [docs/features/](docs/features/README.md).

## Tài liệu cho người bảo trì

| Đọc gì | Khi nào |
|---|---|
| [docs/LUONG_CODE.md](docs/LUONG_CODE.md) | Hiểu kiến trúc, luồng khởi động / điều hướng / dữ liệu ngoài, luồng phát triển một thay đổi |
| [docs/CAU_TRUC_THU_MUC.md](docs/CAU_TRUC_THU_MUC.md) | Tìm file nằm đâu; thêm thư mục (bắt buộc cập nhật — `check:tree` kiểm tra) |
| [docs/BAO_TRI.md](docs/BAO_TRI.md) | Thêm app / trang / thành phố, API lỗi, đổi token, nâng thư viện, deploy, sự cố |
| [docs/features/](docs/features/README.md) | Hành vi chi tiết từng tính năng + file code liên quan |
| [CLAUDE.md](CLAUDE.md) | Quy ước code, dịch vụ ngoài được duyệt, lệnh |
| [CHANGELOG.md](CHANGELOG.md) | Thay đổi theo phiên bản |

Code có ghi chú: mỗi file có chú thích đầu file (làm gì, thuộc tính năng nào), phần export có JSDoc, chỗ khó ghi *vì sao*.

## Lệnh

```bash
npm run check        # tsc + eslint + vitest + check:tree — phải sạch trước khi gộp
npm run build        # bản build vào dist/
npm run format       # Prettier
npm run e2e          # test trình duyệt (Playwright): mọi trang sáng/tối, máy tính + điện thoại, thao tác, lưu dữ liệu
npm run e2e:perf     # đo tốc độ tải trên bản build production (dist-perf/, cổng 4171) — in bảng + so ngân sách
npm run e2e:report   # xem báo cáo HTML (ảnh chụp từng trang, bảng tốc độ)
```
Chi tiết test trình duyệt: [docs/features/test-giao-dien.md](docs/features/test-giao-dien.md). Lần đầu trên máy mới:
`npx playwright install chromium`.
Windows: chạy từ đường dẫn `C:\…` chữ hoa (Vitest lỗi với `c:\`).

## Deploy

Firebase Hosting, site `foxgo` trong project `foxgo-aed1f`:
```bash
npm run fuel:update   # giá xăng kỳ mới nhất → src/data/fuel.json (lỗi mạng thì giữ bản cũ)
npm run check && npm run build
npx firebase-tools deploy --only hosting --project foxgo-aed1f
```

## Công nghệ

Vite 7 · React 18 · TypeScript strict · Ant Design 5 · Vitest · font Be Vietnam Pro (cài local, không CDN).
Dữ liệu ngoài: [Open-Meteo](https://open-meteo.com) (CC BY 4.0), [CoinGecko](https://www.coingecko.com),
[ExchangeRate-API](https://www.exchangerate-api.com) — chỉ để tham khảo.

Một phần của hệ sinh thái FoxGo. Tài liệu chung (quy trình, Definition of Done, design system) nằm ở repo gốc, không đưa lên GitHub.
