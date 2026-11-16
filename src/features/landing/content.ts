/**
 * Nội dung chữ của trang Giới thiệu — xem docs/features/gioi-thieu.md.
 * Bám sản phẩm thật (anh duyệt 16/11/2026): mỗi tính năng gắn với app Fox tương ứng + trạng thái thật trong data/apps.ts;
 * không hứa tính năng chưa có, không nút giả. Số liệu trong giao diện minh họa là số MẪU, không phải dữ liệu của ai.
 */

/** id các mục — dùng cho link `#/gioi-thieu/<id>` trên thanh trên và chân trang. */
export const SECTION = {
  connected: 'he-sinh-thai',
  features: 'tinh-nang',
  overview: 'tong-quan',
  workflow: 'quy-trinh',
  experience: 'trai-nghiem',
} as const

/** Mục trên thanh điều hướng của trang Giới thiệu (Layout đọc). */
export const LANDING_NAV: { id: string; label: string }[] = [
  { id: SECTION.connected, label: 'Hệ sinh thái' },
  { id: SECTION.features, label: 'Tính năng' },
  { id: SECTION.experience, label: 'Về FoxGo' },
]

/**
 * Câu chuyện của từng app ở mục Hệ sinh thái (theo mã app): `moment` = khoảnh khắc đời thường app giúp được;
 * `link` = app này sẽ nối với app khác ra sao — là LỘ TRÌNH giai đoạn 3 (../docs/TAM_NHIN.md), luôn hiện kèm nhãn
 * "Kết nối · lộ trình", không trình bày như đã có.
 */
export const APP_STORY: Record<string, { moment: string; link: string }> = {
  FF: {
    moment: 'Cuối tháng, bạn biết tiền đã đi đâu — và còn bao nhiêu cho mục tiêu.',
    link: 'Học phí, chuyến đi, buổi tập ở các app khác tự đổ về ngân sách.',
  },
  FW: {
    moment: 'Sáng mở máy, ba việc quan trọng nhất đã nằm sẵn.',
    link: 'Giờ tập, giờ học từ Sức khỏe và Học tập giữ chỗ trong lịch làm việc.',
  },
  FH: {
    moment: 'Ngủ đủ, uống đủ, đi đủ bước — chuỗi ngày dài dần.',
    link: 'Lịch khám, lịch tập thành việc trong Công việc; chi phí sang Tài chính.',
  },
  FL: {
    moment: 'Học một chút mỗi ngày, thẻ ôn tập nhắc đúng lúc sắp quên.',
    link: 'Khóa học có chi phí → Tài chính; kỹ năng học được → Kỹ năng.',
  },
  FE: {
    moment: 'Phim muốn xem, chuyến đi muốn thử — không còn nằm rải rác.',
    link: 'Ngân sách chuyến đi lấy từ Tài chính, ngày đi ghi vào Công việc.',
  },
  FS: {
    moment: 'Mỗi giờ luyện tập là một bằng chứng bạn đang tiến lên.',
    link: 'Khóa học bên Học tập thành bằng chứng cho cấp độ kỹ năng.',
  },
}

/** Đoạn kết mục Hệ sinh thái: 3 giai đoạn lộ trình (../docs/TAM_NHIN.md → Kiến trúc tổng thể); giai đoạn 1 = hiện tại. */
export const FINALE = {
  story: 'Không cần nhập một thứ hai lần — mỗi app biết phần việc của mình và báo cho app liên quan.',
  phases: ['Trang chủ lối tắt — đang chạy', 'Một lần đăng nhập cho mọi app', 'Các app nói chuyện với nhau'],
}

/** Tên giao diện minh họa của từng tính năng (mocks/FeatureMocks.tsx). */
export type FeatureMockId = 'task' | 'finance' | 'goal' | 'habit' | 'notes' | 'reminder'

export interface Feature {
  /** id trên trang (mã app chữ thường khi tính năng thuộc một app → `#/gioi-thieu/ff` cuộn tới đây) */
  id: string
  title: string
  desc: string
  points: string[]
  /** Mã app trong data/apps.ts — app thật làm tính năng này */
  apps: string[]
  mock: FeatureMockId
}

/** 6 tính năng — 4 hàng lớn xen kẽ chữ/hình, 2 tính năng cuối đứng cạnh nhau. */
export const FEATURES: Feature[] = [
  {
    id: 'fw',
    title: 'Quản lý công việc',
    desc: 'Ghi việc bằng một câu tiếng Việt, chọn 3 việc quan trọng nhất mỗi ngày và theo dõi tiến độ dự án.',
    points: ['Hạn, mức ưu tiên, việc con, checklist', 'Hôm nay & Big 3', 'Dùng được khi mất mạng'],
    apps: ['FW'],
    mock: 'task',
  },
  {
    id: 'ff',
    title: 'Tài chính cá nhân',
    desc: 'Theo dõi thu chi, ngân sách và mục tiêu tiết kiệm — gõ “cà phê 35k” là xong một dòng sổ.',
    points: ['Ngân sách theo danh mục', 'Mục tiêu tiết kiệm, quỹ dự phòng', 'Nhập sao kê Excel'],
    apps: ['FF'],
    mock: 'finance',
  },
  {
    id: 'fs',
    title: 'Mục tiêu & kế hoạch',
    desc: 'Chia mục tiêu lớn thành cấp độ nhỏ, luyện tập có chủ đích và nhìn thấy mình tiến lên từng bậc.',
    points: ['Cây kỹ năng, cấp độ 1–5 kèm bằng chứng', 'Thử thách 30 ngày'],
    apps: ['FS'],
    mock: 'goal',
  },
  {
    id: 'fh',
    title: 'Thói quen',
    desc: 'Ngủ, vận động, nước uống — ghi nhanh mỗi ngày, giữ chuỗi và xem xu hướng theo tuần, tháng.',
    points: ['Chuỗi ngày đạt mục tiêu', 'Biểu đồ xu hướng tuần/tháng'],
    apps: ['FH'],
    mock: 'habit',
  },
  {
    id: 'fl',
    title: 'Ghi chú & kiến thức',
    desc: 'Ghi chú gắn với khóa học, thẻ ôn tập ngắt quãng để nhớ lâu.',
    points: ['Ghi chú Markdown', 'Thẻ ôn tập SM-2'],
    apps: ['FL'],
    mock: 'notes',
  },
  {
    id: 'nhac-nho',
    title: 'Nhắc nhở đúng lúc',
    desc: '“Thứ 6 9h” thành lịch nhắc; lịch khám định kỳ không bị quên.',
    points: ['Hiểu ngày giờ trong câu', 'Nhắc lịch khám định kỳ'],
    apps: ['FW', 'FH'],
    mock: 'reminder',
  },
]

/** 4 bước làm việc (mục "Bớt rối. Thêm rõ."). */
export const STEPS = [
  { key: 'capture', title: 'Ghi lại', desc: 'Mọi thứ quan trọng vào một chỗ, chỉ bằng một câu.' },
  { key: 'organize', title: 'Sắp xếp', desc: 'Tự xếp vào hôm nay, tuần này hay để sau.' },
  { key: 'act', title: 'Hành động', desc: 'Tập trung từng việc một, xong là đánh dấu.' },
  { key: 'review', title: 'Nhìn lại', desc: 'Cuối tuần xem tiến độ, chỉnh nhịp cho tuần sau.' },
] as const

export type StepKey = (typeof STEPS)[number]['key']

/** Cam kết trải nghiệm (rút từ nguyên tắc sản phẩm ../docs/TAM_NHIN.md — đổi một bên thì đổi cả hai). */
export const PROMISES = [
  { title: 'Đơn giản', desc: 'Mỗi app làm tốt một việc. Không tính năng “để dành”.' },
  { title: 'Mọi màn hình', desc: 'Máy tính, máy tính bảng, điện thoại như nhau — cài được như app.' },
  {
    title: 'Dữ liệu là của bạn',
    desc: 'Nằm trên máy hoặc tài khoản của chính bạn. Không quảng cáo, không analytics.',
  },
  { title: 'Số liệu có nguồn', desc: 'Con số nào cũng truy được về dữ liệu gốc.' },
  { title: 'Một chú cáo đồng hành', desc: 'Nhắc đúng lúc, khen khi bạn giữ nhịp — không phán xét.' },
]

/**
 * Huy hiệu hạ tầng "Vận hành trên" ở chân trang (anh chọn 16/11/2026). Chỉ ghi điều có thật của bản deploy
 * Firebase Hosting (xem CLAUDE.md): chạy trên Google Cloud, phát qua CDN toàn cầu, HTTPS/TLS tự động.
 * KHÔNG phải nhà tài trợ — không ghi "tài trợ", không đặt logo tổ chức không liên quan. Đổi nơi deploy → sửa ở đây.
 */
export const INFRA_BADGES = [
  { key: 'cloud', name: 'Google Cloud', what: 'Lưu trữ trên Firebase Hosting', color: '#4285f4' },
  { key: 'cdn', name: 'CDN', what: 'Tải nhanh từ máy chủ gần bạn', color: '#f59e0b' },
  { key: 'tls', name: 'HTTPS/TLS', what: 'Kết nối được mã hóa đầu cuối', color: '#16a34a' },
] as const

export type InfraBadgeKey = (typeof INFRA_BADGES)[number]['key']

/**
 * Liên hệ ở chân trang (anh yêu cầu công khai 16/11/2026, thay link GitHub).
 * `phone` dạng quốc tế cho `tel:`, `phoneLabel` để hiển thị.
 */
export const CONTACT = {
  phone: '+84392993371',
  phoneLabel: '0392 993 371',
  email: 'thongruby94@gmail.com',
}

/**
 * Đoạn câu chuyện "Vì sao có Fox" ở phần kêu gọi cuối — lời anh viết 16/11/2026 (giữ nguyên chữ "Fox" theo bản gốc).
 * `key` = câu chốt in lớn (các đoạn 01–03 + câu kết đã bỏ theo anh 16/11/2026).
 */
export const MANIFESTO = {
  intro:
    'Mỗi ngày có quá nhiều việc phải nhớ, quá nhiều thứ cần quản lý. Công việc, tiền bạc, sức khỏe và những mục tiêu cá nhân đôi khi khiến chúng ta chẳng biết nên bắt đầu từ đâu.',
  key: ['Fox giúp bạn sắp xếp', 'mọi thứ vào đúng vị trí.'],
}

/** Khẩu hiệu đổi lần lượt dưới tiêu đề kêu gọi cuối (lời anh viết 16/11/2026 + "giảm stress"). */
export const TAGLINES = [
  'Gom mọi điều quan trọng về một nơi.',
  'Sắp xếp cuộc sống theo cách của bạn.',
  'Ít rối hơn, chủ động hơn, sống trọn vẹn hơn.',
  'Bớt áp lực, giảm stress mỗi ngày.',
  'Một nơi cho mọi kế hoạch của bạn.',
  'Làm chủ công việc, tài chính và cuộc sống.',
]

/** Lợi ích ngắn dưới nút kêu gọi cuối. */
export const BENEFITS = [
  'Giảm stress, bớt quá tải',
  'Không bỏ sót việc quan trọng',
  'Rõ tiền đi đâu mỗi tháng',
  'Tiến gần mục tiêu mỗi ngày',
]
