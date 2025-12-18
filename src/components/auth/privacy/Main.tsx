
export default function Main() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/imageBanner.jpg')] bg-no-repeat bg-cover py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-black font-bold text-3xl">Chính Sách Bảo Mật</h1>
            <p className="mt-2 text-gray-500 text-sm">Cập nhật lần cuối: Tháng 12, 2025</p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-gray-700 leading-relaxed">
                Chào mừng bạn đến với nền tảng thương mại điện tử của chúng tôi. Chúng tôi cam kết bảo vệ quyền riêng tư và
                thông tin cá nhân của bạn. Chính sách này giải thích cách chúng tôi thu thập, sử dụng, và bảo vệ dữ liệu của bạn.
              </p>
            </section>

            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">1. Thông Tin Chúng Tôi Thu Thập</h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-lg font-medium text-grey-c800 mb-2">1.1. Thông Tin Cá Nhân</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Họ tên, địa chỉ email, số điện thoại</li>
                    <li>Địa chỉ giao hàng và thanh toán</li>
                    <li>Thông tin tài khoản và mật khẩu</li>
                    <li>Thông tin thanh toán (được mã hóa và bảo mật)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-grey-c800 mb-2">1.2. Thông Tin Tự Động</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Địa chỉ IP, loại trình duyệt, và thiết bị</li>
                    <li>Lịch sử mua sắm và hành vi duyệt web</li>
                    <li>Cookie và công nghệ theo dõi tương tự</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">2. Cách Chúng Tôi Sử Dụng Thông Tin</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Xử lý đơn hàng và giao dịch thanh toán</li>
                <li>Giao hàng và dịch vụ khách hàng</li>
                <li>Cải thiện trải nghiệm người dùng</li>
                <li>Gửi thông báo về đơn hàng và khuyến mãi (với sự đồng ý của bạn)</li>
                <li>Phát hiện và ngăn chặn gian lận</li>
                <li>Tuân thủ nghĩa vụ pháp lý</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">3. Chia Sẻ Thông Tin</h2>
              <div className="space-y-3 text-gray-700">
                <p>Chúng tôi không bán thông tin cá nhân của bạn. Chúng tôi chỉ chia sẻ với:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Đối tác vận chuyển để giao hàng</li>
                  <li>Cổng thanh toán để xử lý giao dịch</li>
                  <li>Nhà cung cấp dịch vụ hỗ trợ vận hành website</li>
                  <li>Cơ quan pháp luật khi có yêu cầu hợp pháp</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">4. Bảo Mật Thông Tin</h2>
              <div className="space-y-3 text-gray-700">
                <p>Chúng tôi áp dụng các biện pháp bảo mật:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải</li>
                  <li>Bảo mật máy chủ và cơ sở dữ liệu</li>
                  <li>Kiểm soát truy cập nghiêm ngặt</li>
                  <li>Giám sát và phát hiện xâm nhập</li>
                </ul>
              </div>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">5. Quyền Của Bạn</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Truy cập và xem thông tin cá nhân của bạn</li>
                <li>Yêu cầu sửa đổi hoặc cập nhật thông tin</li>
                <li>Xóa tài khoản và dữ liệu cá nhân</li>
                <li>Từ chối nhận email marketing</li>
                <li>Rút lại sự đồng ý xử lý dữ liệu</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">6. Cookie</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Website sử dụng cookie để cải thiện trải nghiệm người dùng. Bạn có thể quản lý cookie
                  qua cài đặt trình duyệt của mình.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">7. Thay Đổi Chính Sách</h2>
              <p className="text-gray-700">
                Chúng tôi có thể cập nhật chính sách này theo thời gian. Thay đổi quan trọng sẽ được thông báo
                qua email hoặc thông báo trên website.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t pt-6">
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">Liên Hệ</h2>
              <p className="text-gray-700">
                Nếu bạn có câu hỏi về chính sách bảo mật, vui lòng liên hệ:
              </p>
              <div className="mt-3 text-gray-700">
                <p>Email: support@evoway.com</p>
                <p>Điện thoại: 0867254603</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}