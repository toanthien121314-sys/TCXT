// ĐỔI SỐ PHIÊN BẢN NÀY (v2, v3, v4...) MỖI KHI BẠN THAY ĐỔI CODE HTML HAY ẢNH LOGO
const CACHE_NAME = 'meow-fin-v1'; 

// Danh sách các file cốt lõi cần lưu vào điện thoại
const urlsToCache = [
  '/TC/',
  '/TC/index.html',
  '/TC/manifest.json',
  '/TC/icon.png'
];

// BƯỚC 1: CÀI ĐẶT (Tải vỏ app vào bộ nhớ đệm)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Đang lưu đệm các file hệ thống...');
        return cache.addAll(urlsToCache);
      })
  );
  // Ép bản cập nhật mới nhận quyền điều khiển ngay lập tức
  self.skipWaiting(); 
});

// BƯỚC 2: KÍCH HOẠT (Dọn rác/phiên bản cũ)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Xóa những bản cache cũ không khớp với CACHE_NAME hiện tại
          if (cacheName !== CACHE_NAME) {
            console.log('Đã xóa bộ nhớ đệm phiên bản cũ:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// BƯỚC 3: ĐÁNH CHẶN YÊU CẦU TẢI (Fetch)
self.addEventListener('fetch', event => {
  // 1. Bỏ qua hoàn toàn link Google Apps Script (để Google tự load dữ liệu thực tế)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // 2. Chiến lược: Ưu tiên lấy từ bộ nhớ đệm (Cache First) cho vỏ app
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Nếu tìm thấy trong điện thoại -> Trả về luôn (siêu nhanh)
        if (response) {
          return response;
        }
        // Nếu không có -> Bắt buộc tải từ mạng
        return fetch(event.request);
      })
  );
});
