/** Lời chào & định dạng ngày giờ — hàm thuần, nhận Date để test được. */

export function greeting(hour: number): string {
  if (hour < 5) return 'Khuya rồi'
  if (hour < 11) return 'Chào buổi sáng'
  if (hour < 13) return 'Chào buổi trưa'
  if (hour < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}

/** Câu nhắn nhỏ dưới lời chào, đổi theo khung giờ. */
export function nudge(hour: number): string {
  if (hour < 5) return 'Nghỉ ngơi đi, mai làm tiếp nhé.'
  if (hour < 11) return 'Chọn 3 việc quan trọng nhất cho hôm nay.'
  if (hour < 13) return 'Đứng dậy vận động và uống nước một chút.'
  if (hour < 18) return 'Còn nửa ngày — kiểm tra lại tiến độ nào.'
  if (hour < 22) return 'Ghi lại khoản chi hôm nay trước khi quên.'
  return 'Tắt màn hình sớm để ngủ ngon hơn.'
}

const WEEKDAYS = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']

const pad = (n: number) => String(n).padStart(2, '0')

/** "Thứ bảy, 14/11/2026" */
export function formatDate(d: Date): string {
  return `${WEEKDAYS[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

/** "08:05" (24h) */
export function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}
