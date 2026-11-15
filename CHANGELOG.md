# Nhật ký thay đổi — FoxGo_Manager

Theo [Keep a Changelog](https://keepachangelog.com/vi/1.1.0/), phiên bản theo SemVer.

## [Chưa phát hành]
### Đổi (15/11/2026)
- Logo FoxGo mới (favicon / icon cài app): mặt cáo tròn + đuôi cuộn chóp trắng trên nền tối — sinh bằng
  `Fox.Files/tools/gen_fox.py` (`svg/logo/foxgo-icon.svg`).
- Ô Fox.CôngViệc trỏ bản web https://foxgo-work.web.app (trước đó: link tạm bản trên máy, cổng 5175).
- `chay_local.bat`: nhấp đúp chạy trên máy (dev :5170 hoặc build + preview :4170).
- Thanh thông số luôn thu nhỏ khi mở trang (không nhớ lựa chọn mở nữa).
### Thêm
- Nút **Cài đặt** trên thanh thông số → popup: mở app/link trong tab mới, sắp xếp thứ tự ô, thêm/xóa link riêng
  (hiện thành ô trên trang chủ). Lưu trên máy (`foxdots.prefs`).
- Thanh thông số: dòng **Xăng RON95** (giá bán lẻ Petrolimex vùng 1, kỳ điều hành) — snapshot `src/data/fuel.json`
  tạo bằng `npm run fuel:update`, trình duyệt không gọi thêm dịch vụ nào.
- Trang chủ (`#/`) tối giản theo màn khóa Fox.TàiChính: nền lưới chấm + vầng sáng, cáo trong khung kính, ô app dạng kính
  (app kế hoạch: viền đứt, mờ); chân trang "FoxGo 2026 by Thong Duy".
- Thanh thông số dọc bên trái (màn hẹp: ngăn kéo trượt từ trái): giờ + lời chào, thời tiết (chọn thành phố, 3 ngày — Open-Meteo),
  vàng thế giới quy đổi đ/lượng + Bitcoin (CoinGecko), USD/VND (ExchangeRate-API); khung chờ khi tải, đệm,
  dùng bản cũ khi mất mạng, nguồn trong tooltip.
- Thanh thông số mặc định thu hẹp thành dải (giờ + nhiệt độ), mở rộng khi bấm và nhớ trên máy; ô chọn thành phố tối, tìm không dấu.
- Logo chữ "Fox." (chữ đậm khít + chấm cam) ở giữa trang chủ và thanh đầu trang Giới thiệu.
- "Giới thiệu" nằm ở đáy thanh thông số (thu hẹp: chỉ biểu tượng), gạch chia mảnh mờ hai đầu; chân trang "FoxDots® │ Thong Duy".
- Ô app có mô tả ngắn mờ bên dưới tên; rê chuột/Tab vào ô hiện thẻ 3 đầu mục nổi bật (vạch màu nhấn, viền mảnh); điện thoại: lưới 3 cột.
- Tên app tách chữ ("Tài Chính"); khối thời tiết gọn một hàng (nhiệt độ + thành phố); điện thoại: thanh thông số ẩn sau nút menu, mở thành ngăn kéo trượt trái.
- Thu/mở thanh thông số mượt: dựng sẵn một lần, máy tính giãn 64→280px đè lên nội dung (không đẩy bố cục), điện thoại trượt bằng transform; bỏ làm mờ kính trên ngăn kéo.
- Trang chủ không cho bôi đen chữ / kéo hình (như màn khóa); giá thị trường tự thử lại sau 1 phút khi lỗi (CoinGecko hay trả 429).
- Trang Giới thiệu (`#/gioi-thieu`): hero tràn viền (lưới + vầng sáng theo màn đăng nhập Fox.TàiChính) với cáo giữa quỹ đạo
  6 linh vật app, bento hệ sinh thái, 6 nguyên tắc, linh vật Fox (8 biểu cảm), lộ trình dạng bước, băng kêu gọi cuối.
- Định tuyến bằng hash (chạy trên hosting tĩnh); token `--grid-line`, `--h-*`.
### Đổi
- Bỏ ô tìm app, câu nhắc theo giờ và lưới thẻ app cũ (`AppCard`).
- Đổi tên thương hiệu Foxdots → **FoxGo** (FD-012): chân trang, tiêu đề tab, mô tả, manifest PWA, nhãn trợ năng.
- Cấu hình Firebase Hosting, project `foxgo-aed1f` (FD-004).
- Bộ tài liệu bảo trì: README chuẩn, `docs/LUONG_CODE.md` (kiến trúc + luồng), `docs/CAU_TRUC_THU_MUC.md` (cây thư mục,
  `npm run check:tree` tự kiểm tra), `docs/BAO_TRI.md`, `docs/features/` (6 tính năng). Ghi chú đầu file + JSDoc cho toàn bộ code.
- Fox.CôngViệc: trạng thái "Đang xây" v0.1, cập nhật tính năng chính.
- Bỏ hàm không còn dùng `filterApps`, `openable`, `countByStatus` và 2 SVG không dùng (`fox-foxdots`, `fox-vay-duoi`).

## [0.1.0] — 2026-11-14
### Thêm
- FD-002: trang tổng hợp các app Fox — lời chào theo giờ, đồng hồ, ngày tiếng Việt, câu nhắc nhỏ.
- Tìm app không dấu (phím `/` để tìm, Enter mở khi chỉ còn một app), trạng thái rỗng có nút xóa tìm kiếm.
- Lưới thẻ app: "Ứng dụng của bạn" (Fox.TàiChính: web + trên máy + Test) và "Sắp ra mắt" (5 app kế hoạch).
- Linh vật cáo theo từng app (từ Fox.Files) trên thẻ và phần chào.
- Giao diện sáng / tối / theo hệ thống, token màu Fox chuẩn, mobile 375px.
