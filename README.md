# Ecommerce Frontend Project

Dự án frontend cho hệ thống thương mại điện tử, được xây dựng dựa trên [Next.js](https://nextjs.org/) và các công nghệ web hiện đại.

## 🚀 Giới thiệu

Đây là giao diện người dùng (Client-side) cho ứng dụng Ecommerce, cung cấp các tính năng mua sắm, quản lý đơn hàng, và bảng điều khiển cho người quản trị.

## 🛠 Công nghệ sử dụng

Dự án sử dụng các thư viện và công nghệ sau:

- **Core**: [Next.js](https://nextjs.org/) (App Router), [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **UI Framework**: [Material UI (MUI)](https://mui.com/), [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Data Fetching**: [SWR](https://swr.vercel.app/), [Axios](https://axios-http.com/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Charts**: [Nivo Charts](https://nivo.rocks/)
- **Real-time**: [StompJS](https://github.com/stomp-js/stompjs) (WebSocket)

## ⚙️ Yêu cầu hệ thống

- [Node.js](https://nodejs.org/) (Khuyên dùng phiên bản LTS mới nhất)
- [npm](https://www.npmjs.com/) hoặc [yarn](https://yarnpkg.com/)

## 📦 Cài đặt

1. Clone dự án:
```bash
git clone <repository-url>
cd ecommerce
```

2. Cài đặt các thư viện phụ thuộc:
```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
# hoặc
bun install
```

## 🔧 Cấu hình

Tạo file `.env` tại thư mục gốc của dự án và cấu hình các biến môi trường sau:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WEB_SOCKET_URL=ws://localhost:8080/ws
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<YOUR_VAPID_Key>
```

| Biến | Mô tả | Mặc định |
|------|-------|----------|
| `NEXT_PUBLIC_API_URL` | URL của Backend API | `http://localhost:8080` |
| `NEXT_PUBLIC_WEB_SOCKET_URL` | URL của WebSocket Server | `ws://localhost:8080/ws` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Public Key cho Web Push Notifications | |

## ▶️ Chạy ứng dụng

Chạy server phát triển (Development server):

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để xem kết quả.

## 📂 Cấu trúc dự án

```
src/
├── app/          # Core logic và routing của Next.js (App Router)
├── components/   # Các thành phần giao diện (UI Components) tái sử dụng
├── hooks/        # Các Custom React Hooks
├── libs/         # Các thư viện tiện ích
├── redux/        # Quản lý trạng thái ứng dụng (Redux state)
├── services/     # Các service gọi API
├── types/        # Định nghĩa kiểu dữ liệu TypeScript
└── util/         # Các hàm tiện ích chung
```

## 📜 Kịch bản (Scripts)

- `npm run dev`: Chạy server phát triển.
- `npm run build`: Build ứng dụng cho môi trường production.
- `npm run start`: Chạy ứng dụng đã build.
- `npm run lint`: Kiểm tra lỗi cú pháp (Linting).
