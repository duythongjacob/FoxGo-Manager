# Cấu trúc thư mục — FoxGo Manager

Bản đồ toàn bộ app: mỗi thư mục làm gì, chứa gì.

> **Quy tắc bắt buộc:** thêm / đổi tên / xóa thư mục nào thì **cập nhật file này trong cùng commit** —
> cả **cây thư mục** lẫn **bảng ý nghĩa** bên dưới.
> `npm run check` có bước `check:tree` tự so thư mục thật với bảng: thiếu hoặc thừa dòng là báo lỗi.

Ký hiệu: ⚙️ sinh tự động (không commit) · 🌐 công khai khi deploy (mọi người tải được).

## Cây thư mục

```text
FoxGo_Manager/  (trong FoxdotsProject/ — tài liệu chung ở ../docs/)
├── README.md                 giới thiệu, chạy, tính năng, deploy — đọc đầu tiên
├── CLAUDE.md                 quy ước khi code cho Claude (nguyên tắc, dịch vụ ngoài được duyệt, lệnh)
├── CHANGELOG.md              nhật ký thay đổi theo phiên bản
├── index.html                trang HTML gốc + script đặt sáng/tối trước khi vẽ
├── package.json              thư viện + lệnh npm (dev, check, build)
├── vite.config.ts            cấu hình Vite + Vitest (cổng, alias @/, số phiên bản)
├── firebase.json             cấu hình Firebase Hosting (site foxgo)
├── chay_local.bat            nhấp đúp để chạy trên máy: dev :5170 hoặc build + preview :4170
│
├── docs/                     tài liệu của app
│   ├── CAU_TRUC_THU_MUC.md       file này
│   ├── LUONG_CODE.md             luồng chạy, luồng dữ liệu, luồng phát triển
│   ├── BAO_TRI.md                việc bảo trì thường gặp, xử lý sự cố
│   └── features/                 mỗi tính năng một file md + README.md mục lục
├── scripts/                  lệnh Node phụ trợ (check-tree.mjs, fuel-update.mjs)
├── public/                   🌐 file tĩnh chép nguyên vào bản build: manifest, icon
│   └── fox/                  🌐 linh vật SVG (sinh từ ../Fox.Files, không vẽ tay)
│       └── bieu-cam/         🌐 8 biểu cảm của cáo (trang Giới thiệu)
└── src/
    ├── main.tsx              điểm vào: font, CSS, vẽ <Root/>
    ├── app/                  khung app: Root (theme + chọn trang), Layout, hook điều hướng, lưu theme
    ├── components/           UI dùng chung ≥ 2 nơi (logo chữ, biểu tượng thời tiết)
    ├── data/                 dữ liệu & nguồn ngoài: danh sách app, gọi API thời tiết/giá + đệm
    ├── features/             mỗi thư mục = 1 trang
    │   ├── launcher/             Trang chủ (#/) + thanh thông số
    │   └── landing/              Giới thiệu (#/gioi-thieu)
    ├── lib/                  hàm thuần + *.test.ts — không import React/antd
    └── styles/               global.css: token màu Fox (bản chuẩn của hệ sinh thái)
```

Không liệt kê (bỏ qua khi kiểm tra): `node_modules/`, `dist/`, `.git/`, `.firebase/`, `coverage/`, `.vite/`.

## Bảng ý nghĩa

| Thư mục | Chức năng | Ghi chú |
|---|---|---|
| `docs/` | Tài liệu app: cấu trúc, luồng code, bảo trì | Repo GitHub công khai — không ghi dữ liệu cá nhân |
| `docs/features/` | Tài liệu từng tính năng (mẫu `../docs/templates/FEATURE.md`), mục lục `README.md` | Viết cùng commit với code |
| `scripts/` | Lệnh Node phụ trợ: `check-tree.mjs` (so file này với thư mục thật), `fuel-update.mjs` + `fuel-parse.mjs` (giá xăng → `src/data/fuel.json`) | Chạy trong `npm run check` |
| `public/` | File tĩnh: `manifest.webmanifest` (cài như app), `icon.svg` | 🌐 |
| `public/fox/` | Linh vật: đầu `fox-<app>.svg`, toàn thân `*-toan-than.svg`, cáo vẫy tay, cáo giới thiệu | 🌐 Sinh bằng `../Fox.Files/tools/gen_fox.py` rồi chép sang |
| `public/fox/bieu-cam/` | 8 biểu cảm `fox-<tên>.svg` | 🌐 Tên khớp `EXPRESSIONS` trong LandingPage |
| `src/` | Mã nguồn TypeScript/React | Luồng: `docs/LUONG_CODE.md` |
| `src/app/` | `Root.tsx` (theme AntD + chọn trang), `Layout.tsx`, `useRoute.ts`, `themeStore.ts` | Không chứa logic nghiệp vụ |
| `src/components/` | `Wordmark.tsx` (logo "Fox."), `WxIcon.tsx` (biểu tượng thời tiết SVG) | Chỉ đặt ở đây khi ≥ 2 nơi dùng |
| `src/data/` | `apps.ts` (danh sách app), `external.ts` (gọi Open-Meteo/CoinGecko/ExchangeRate-API + đệm), `fuel.json` (snapshot giá xăng), `prefs.ts` (đọc/ghi thiết lập trang chủ) | Mọi lệnh gọi mạng nằm ở đây |
| `src/features/` | Mỗi thư mục con = 1 trang (Page.tsx + CSS riêng + component riêng) | |
| `src/features/launcher/` | Trang chủ: `LauncherPage.tsx`, `InfoDock.tsx` (thanh thông số), `launcher.css` | `docs/features/trang-chu.md`, `thanh-thong-so.md` |
| `src/features/landing/` | Trang Giới thiệu: `LandingPage.tsx`, `landing.css` | `docs/features/gioi-thieu.md` |
| `src/lib/` | Hàm thuần có test: `apps`, `greeting`, `theme`, `route`, `weather`, `market` | Không import React/antd |
| `src/styles/` | `global.css`: token màu sáng/tối, nền, logo chữ, hiệu ứng | Đổi token → cập nhật `../docs/DESIGN_SYSTEM.md` |
