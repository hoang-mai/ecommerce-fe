export default function Main() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('/imageBanner.jpg')] bg-no-repeat bg-cover py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-black font-bold text-3xl">Điều Khoản Dịch Vụ</h1>
            <p className="mt-2 text-gray-500 text-sm">Cập nhật lần cuối: Tháng 12, 2025</p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <p className="text-gray-700 leading-relaxed">
                Chào mừng bạn đến với nền tảng thương mại điện tử của chúng tôi. Vui lòng đọc kỹ các điều khoản dịch vụ
                này trước khi sử dụng website. Việc sử dụng dịch vụ của chúng tôi đồng nghĩa với việc bạn chấp nhận
                các điều khoản này.
              </p>
            </section>

            {/* Section 1 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">1. Chấp Nhận Điều Khoản</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Bằng việc truy cập và sử dụng website này, bạn đồng ý tuân thủ các điều khoản và điều kiện được
                  quy định trong tài liệu này. Nếu không đồng ý với bất kỳ phần nào, vui lòng không sử dụng dịch vụ.
                </p>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">2. Tài Khoản Người Dùng</h2>
              <div className="space-y-3 text-gray-700">
                <h3 className="text-lg font-medium text-grey-c800">2.1. Đăng Ký Tài Khoản</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Bạn phải từ 18 tuổi trở lên để đăng ký tài khoản</li>
                  <li>Thông tin đăng ký phải chính xác và đầy đủ</li>
                  <li>Bạn chịu trách nhiệm bảo mật thông tin tài khoản</li>
                  <li>Mỗi người chỉ được tạo một tài khoản</li>
                </ul>
                <h3 className="text-lg font-medium text-grey-c800 mt-4">2.2. Trách Nhiệm Người Dùng</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Không chia sẻ tài khoản với người khác</li>
                  <li>Thông báo ngay khi phát hiện tài khoản bị xâm nhập</li>
                  <li>Chịu trách nhiệm về mọi hoạt động từ tài khoản của bạn</li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">3. Mua Hàng và Thanh Toán</h2>
              <div className="space-y-3 text-gray-700">
                <h3 className="text-lg font-medium text-grey-c800">3.1. Đặt Hàng</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Kiểm tra kỹ thông tin sản phẩm trước khi đặt hàng</li>
                  <li>Giá cả có thể thay đổi mà không cần báo trước</li>
                  <li>Chúng tôi có quyền từ chối hoặc hủy đơn hàng trong một số trường hợp</li>
                </ul>
                <h3 className="text-lg font-medium text-grey-c800 mt-4">3.2. Thanh Toán</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Hỗ trợ nhiều phương thức thanh toán an toàn</li>
                  <li>Thanh toán phải được hoàn tất trước khi giao hàng</li>
                  <li>Hóa đơn điện tử sẽ được gửi qua email</li>
                </ul>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">4. Giao Hàng</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Thời gian giao hàng dự kiến: 3-7 ngày làm việc</li>
                <li>Phí vận chuyển tùy theo địa chỉ giao hàng</li>
                <li>Kiểm tra hàng hóa khi nhận và báo ngay nếu có vấn đề</li>
                <li>Chúng tôi không chịu trách nhiệm về địa chỉ giao hàng sai do lỗi của khách hàng</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">5. Đổi Trả và Hoàn Tiền</h2>
              <div className="space-y-3 text-gray-700">
                <h3 className="text-lg font-medium text-grey-c800">5.1. Điều Kiện Đổi Trả</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Sản phẩm còn nguyên vẹn, chưa qua sử dụng</li>
                  <li>Còn đầy đủ tem, nhãn mác, hóa đơn</li>
                  <li>Trong vòng 7 ngày kể từ ngày nhận hàng</li>
                  <li>Một số sản phẩm đặc biệt không áp dụng đổi trả</li>
                </ul>
                <h3 className="text-lg font-medium text-grey-c800 mt-4">5.2. Hoàn Tiền</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Hoàn tiền trong vòng 7-14 ngày làm việc</li>
                  <li>Hoàn về tài khoản hoặc phương thức thanh toán gốc</li>
                  <li>Khách hàng chịu phí vận chuyển đổi trả (trừ lỗi từ shop)</li>
                </ul>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">6. Quyền Sở Hữu Trí Tuệ</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Tất cả nội dung trên website bao gồm văn bản, hình ảnh, logo, thiết kế đều thuộc quyền sở hữu
                  của chúng tôi hoặc được cấp phép sử dụng. Nghiêm cấm sao chép, phân phối mà không có sự đồng ý.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">7. Hành Vi Bị Cấm</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Sử dụng website cho mục đích bất hợp pháp</li>
                <li>Cố gắng truy cập trái phép vào hệ thống</li>
                <li>Đăng tải nội dung vi phạm pháp luật, xúc phạm</li>
                <li>Gian lận thanh toán hoặc lợi dụng khuyến mãi</li>
                <li>Sử dụng bot, script tự động để mua hàng</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">8. Giới Hạn Trách Nhiệm</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Chúng tôi không chịu trách nhiệm về:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Thiệt hại gián tiếp phát sinh từ việc sử dụng dịch vụ</li>
                  <li>Sự gián đoạn dịch vụ do bảo trì hoặc sự cố kỹ thuật</li>
                  <li>Thông tin từ các website liên kết bên ngoài</li>
                  <li>Hành vi của người dùng khác trên nền tảng</li>
                </ul>
              </div>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">9. Chấm Dứt Dịch Vụ</h2>
              <div className="space-y-3 text-gray-700">
                <p>
                  Chúng tôi có quyền đình chỉ hoặc chấm dứt tài khoản của bạn nếu:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Vi phạm các điều khoản dịch vụ</li>
                  <li>Có hành vi gian lận hoặc lạm dụng</li>
                  <li>Theo yêu cầu của cơ quan pháp luật</li>
                </ul>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">10. Thay Đổi Điều Khoản</h2>
              <p className="text-gray-700">
                Chúng tôi có quyền sửa đổi các điều khoản này bất kỳ lúc nào. Thay đổi có hiệu lực ngay khi được
                đăng tải. Việc tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận
                điều khoản mới.
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">11. Luật Áp Dụng</h2>
              <p className="text-gray-700">
                Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Mọi tranh chấp sẽ được giải quyết
                tại tòa án có thẩm quyền.
              </p>
            </section>

            {/* Contact */}
            <section className="border-t pt-6">
              <h2 className="text-xl font-semibold text-grey-c800 mb-4">Liên Hệ</h2>
              <p className="text-gray-700">
                Nếu bạn có câu hỏi về điều khoản dịch vụ, vui lòng liên hệ:
              </p>
              <div className="mt-3 text-gray-700">
                <p>Email: support@evoway.com</p>
                <p>Điện thoại: 0867254603</p>
                <p>Địa chỉ: Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà nội, Việt Nam</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

