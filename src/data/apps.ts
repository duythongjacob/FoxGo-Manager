import type { FoxApp } from '@/lib/apps'

/**
 * Danh sách app Fox. Thêm app mới → thêm 1 mục ở đây + cập nhật docs/MA_APP.md.
 * Bundle web là công khai: chỉ link & mô tả chung, KHÔNG số liệu cá nhân.
 */
export const APPS: FoxApp[] = [
  {
    code: 'FF',
    name: 'Fox.TàiChính',
    area: 'Tài chính',
    desc: 'Sổ thu chi, ngân sách, mục tiêu tiết kiệm, thuế — cùng chú cáo kế toán.',
    mascot: '/fox/fox-taichinh.svg',
    accent: '#0f766e',
    status: 'live',
    version: '2.26',
    url: 'https://finfox-finance.web.app',
    extra: [
      { label: 'Trên máy', url: 'http://localhost:5173' },
      { label: 'Test', url: 'http://localhost:5174' },
    ],
    tags: ['thu chi', 'tien', 'ngan sach', 'luong', 'tiet kiem'],
  },
  {
    code: 'FW',
    name: 'Fox.CôngViệc',
    area: 'Công việc',
    desc: 'Việc hôm nay, dự án, phiên tập trung và tổng kết tuần.',
    mascot: '/fox/fox-congviec.svg',
    accent: '#2563eb',
    status: 'planned',
    tags: ['todo', 'viec can lam', 'du an', 'pomodoro'],
  },
  {
    code: 'FH',
    name: 'Fox.SứcKhỏe',
    area: 'Sức khỏe',
    desc: 'Giấc ngủ, vận động, cân nặng, nước uống — theo dõi xu hướng.',
    mascot: '/fox/fox-suckhoe.svg',
    accent: '#e11d48',
    status: 'planned',
    tags: ['ngu', 'the duc', 'can nang', 'buoc chan'],
  },
  {
    code: 'FL',
    name: 'Fox.HọcTập',
    area: 'Học tập',
    desc: 'Khóa học, nhật ký học, thẻ ôn tập ngắt quãng.',
    mascot: '/fox/fox-hoctap.svg',
    accent: '#7c3aed',
    status: 'planned',
    tags: ['khoa hoc', 'sach', 'on tap', 'flashcard'],
  },
  {
    code: 'FE',
    name: 'Fox.GiảiTrí',
    area: 'Giải trí',
    desc: 'Phim, sách, game, chuyến đi muốn thử — và những gì đã trải nghiệm.',
    mascot: '/fox/fox-giaitri.svg',
    accent: '#db2777',
    status: 'planned',
    tags: ['phim', 'game', 'du lich', 'nhac'],
  },
  {
    code: 'FS',
    name: 'Fox.KỹNăng',
    area: 'Kỹ năng',
    desc: 'Cây kỹ năng, giờ luyện tập có chủ đích, thử thách 30 ngày.',
    mascot: '/fox/fox-kynang.svg',
    accent: '#ca8a04',
    status: 'planned',
    tags: ['ky nang', 'luyen tap', 'thu thach', 'cv'],
  },
]
