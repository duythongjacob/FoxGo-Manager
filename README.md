# FoxGo Manager

Trang tổng hợp các app Fox — ghim làm trang chủ trình duyệt. Bản chạy: **https://foxgo.web.app**

Vite + React + Ant Design. Chỉ chứa link và mô tả chung các app, không đọc dữ liệu cá nhân.
Thời tiết / giá vàng / Bitcoin / USD lấy từ Open-Meteo, CoinGecko, ExchangeRate-API.

```bash
npm install
npm run dev      # http://localhost:5170
npm run check    # tsc + eslint + vitest
npm run build
```

**Ghim làm trang chủ** (Chrome/Edge): Cài đặt → *Khi khởi động* → *Mở một trang cụ thể* → `https://foxgo.web.app`;
và *Giao diện* → *Hiện nút Trang chủ* → cùng địa chỉ.

**Deploy** (Firebase Hosting, site `foxgo` trong project `foxgo-aed1f`):
```bash
npm run build
npx firebase-tools deploy --only hosting --project foxgo-aed1f
```

Thêm app: sửa `src/data/apps.ts`.
