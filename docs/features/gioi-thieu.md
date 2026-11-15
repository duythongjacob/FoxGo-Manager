# Trang Giới thiệu

> Mã: `FD-002` · PRD: — · Cập nhật: 15/11/2026 · Trạng thái: Đang chạy

## Mục đích
Landing page giải thích FoxGo là gì: các app, nguyên tắc, linh vật, lộ trình. Vào từ nút "Giới thiệu" ở thanh thông số.

## Cách dùng / hành vi
Đường dẫn `#/gioi-thieu` (mục con `#/gioi-thieu/<mã app>` cuộn tới app đó, VD `#/gioi-thieu/ff`).
Có thanh trên kính tối (logo, "Trang chủ", nút sáng/tối) và chân trang. Các mục theo thứ tự:
1. **Hero** tràn viền: tiêu đề, 2 nút "Mở trang chủ" / "Xem các app" (cuộn mượt), 3 cam kết;
   bên phải cáo vẫy tay + linh vật các app xoay trên quỹ đạo.
2. **Hệ sinh thái** (bento): app đang chạy chiếm ô lớn 2×2 (linh vật toàn thân, tính năng, nút mở),
   các app khác ô nhỏ kèm trạng thái.
3. **Nguyên tắc**: 6 nguyên tắc sản phẩm + cáo giới thiệu.
4. **Linh vật**: 8 biểu cảm của cáo.
5. **Lộ trình**: 3 giai đoạn, đánh dấu giai đoạn hiện tại.
6. **Kêu gọi cuối**: ghim trang chủ làm trang mở đầu + nút "Mở trang chủ".

Màn ≤ 960px / ≤ 640px: lưới bento và các cột co lại một cột. Tôn trọng "giảm chuyển động" (quỹ đạo ngừng xoay).

## Quy tắc nghiệp vụ
- Nội dung nguyên tắc và lộ trình **khớp** `../docs/TAM_NHIN.md` — đổi một bên thì đổi cả hai.
- Chỉ mô tả chung về app, không số liệu cá nhân.

## Dữ liệu
Không lưu gì. Đọc `src/data/apps.ts` (danh sách app) và SVG trong `public/fox/`, `public/fox/bieu-cam/`.

## Mã nguồn
| File | Vai trò |
|---|---|
| `src/features/landing/LandingPage.tsx` | Toàn bộ trang; hằng `PRINCIPLES`, `EXPRESSIONS`, `PHASES`; component `Orbit`, `FeaturedApp`, `SmallApp`, `Head` |
| `src/features/landing/landing.css` | Kiểu `.ld-*` (hero gốc login.css của Fox.TàiChính) |
| `src/app/Layout.tsx` | Thanh trên + chân trang ở chế độ `is-landing` |

## Kiểm thử
- Tự động: `src/lib/route.test.ts` (đường dẫn `#/gioi-thieu`, mục con).
- Tay: các nút cuộn đúng mục; `#/gioi-thieu/ff` cuộn tới ô Fox.TàiChính; sáng/tối; 375px không tràn.

## Giới hạn & việc còn lại
- Chữ viết cứng trong component — chưa tách nội dung ra file riêng (chưa cần).

## Lịch sử
| Ngày | Phiên bản | Thay đổi |
|---|---|---|
| 15/11/2026 | chưa phát hành | Bản đầu; đổi tên thương hiệu FoxGo |
