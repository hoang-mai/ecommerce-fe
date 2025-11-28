'use client';
import React, {useState} from 'react';

// Replaced custom icons with MUI icons (aliased to the original names used in the JSX)
import Calendar from '@mui/icons-material/CalendarMonth';
import User from '@mui/icons-material/Person';
import Eye from '@mui/icons-material/Visibility';
import MapPin from '@mui/icons-material/LocationOn';
import Phone from '@mui/icons-material/Phone';
import Title from "@/libs/Title";
import TextField from "@/libs/TextField";
import DropdownSelect from "@/libs/DropdownSelect";
import {formatDate, formatPrice} from "@/util/FnCommon";
import Button from "@/libs/Button";
import {ColorButton, OrderStatus} from "@/type/enum";
import Divide from "@/libs/Divide";
import OrderDetailModal from "@/components/user/order/OrderDetailModal";
import Chip, {ChipColor, ChipVariant} from "@/libs/Chip";


interface Attribute {
  attributeName: string;
  attributeValue: string;
}

interface Variant {
  _id: string;
  price: number;
  quantity: number;
  productAttributes: Attribute[];
}

interface ProductImage {
  _id: string;
  imageUrl: string;
}

interface OrderItem {
  _id: string;
  productId: string;
  productName: string;
  productImageList: ProductImage[];
  productVariants: Variant[];
}

interface Order {
  _id: string;
  userId: string;
  orderStatus: OrderStatus;
  totalPrice: number;
  paymentId: string;
  receiverName: string;
  address: string;
  phoneNumber: string;
  createdAt: string;
  orderItems: OrderItem[];
}


export default function Main() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const statusOptions = [
    {id: 'all', label: 'Tất cả trạng thái'},
    {id: 'PENDING', label: 'Chờ xác nhận'},
    {id: 'PAID', label: 'Đã thanh toán'},
    {id: 'CONFIRMED', label: 'Đã xác nhận'},
    {id: 'SHIPPED', label: 'Đang giao'},
    {id: 'DELIVERED', label: 'Đang vận chuyển'},
    {id: 'COMPLETED', label: 'Hoàn thành'},
    {id: 'RETURNED', label: 'Đã trả hàng'},
    {id: 'CANCELLED', label: 'Đã hủy'},
  ];
  // Mock data theo cấu trúc entity của bạn
  const mockOrders: Order[] = [
    {
      _id: "ORD001",
      userId: "USER123",
      orderStatus: OrderStatus.DELIVERED,
      totalPrice: 1250000,
      paymentId: "PAY001",
      receiverName: "Nguyễn Văn A",
      address: "123 Đường ABC, Quận 1, TP.HCM",
      phoneNumber: "0901234567",
      createdAt: "2024-11-20T10:30:00",
      orderItems: [
        {
          _id: "ITEM001",
          productId: "PROD001",
          productName: "iPhone 15 Pro Max",
          productImageList: [
            {_id: "IMG001", imageUrl: "https://images.unsplash.com/photo-1592286927505-decc49a1394a?w=400"}
          ],
          productVariants: [
            {
              _id: "VAR001",
              price: 1250000,
              quantity: 1,
              productAttributes: [
                {attributeName: "Màu sắc", attributeValue: "Titan Tự Nhiên"},
                {attributeName: "Dung lượng", attributeValue: "256GB"}
              ]
            }
          ]
        }
      ]
    },
    {
      _id: "ORD002",
      userId: "USER456",
      orderStatus: OrderStatus.CONFIRMED,
      totalPrice: 850000,
      paymentId: "PAY002",
      receiverName: "Trần Thị B",
      address: "456 Đường XYZ, Quận 3, TP.HCM",
      phoneNumber: "0912345678",
      createdAt: "2024-11-19T14:20:00",
      orderItems: [
        {
          _id: "ITEM002",
          productId: "PROD002",
          productName: "MacBook Air M2",
          productImageList: [
            {_id: "IMG002", imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400"}
          ],
          productVariants: [
            {
              _id: "VAR002",
              price: 850000,
              quantity: 1,
              productAttributes: [
                {attributeName: "Màu sắc", attributeValue: "Silver"},
                {attributeName: "RAM", attributeValue: "8GB"}
              ]
            }
          ]
        }
      ]
    },
    {
      _id: "ORD003",
      userId: "USER789",
      orderStatus: OrderStatus.DELIVERED,
      totalPrice: 450000,
      paymentId: "PAY003",
      receiverName: "Lê Văn C",
      address: "789 Đường DEF, Quận 7, TP.HCM",
      phoneNumber: "0923456789",
      createdAt: "2024-11-18T09:15:00",
      orderItems: [
        {
          _id: "ITEM003",
          productId: "PROD003",
          productName: "AirPods Pro 2",
          productImageList: [
            {_id: "IMG003", imageUrl: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400"}
          ],
          productVariants: [
            {
              _id: "VAR003",
              price: 450000,
              quantity: 1,
              productAttributes: [
                {attributeName: "Phiên bản", attributeValue: "USB-C"}
              ]
            }
          ]
        }
      ]
    }
  ];

  const getLabelStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Chờ xác nhận';
      case OrderStatus.PAID:
        return 'Đã thanh toán';
      case OrderStatus.CONFIRMED:
        return 'Đã xác nhận';
      case OrderStatus.DELIVERED:
        return 'Đang vận chuyển';
      case OrderStatus.SHIPPED:
        return 'Đang giao';
      case OrderStatus.CANCELLED:
        return 'Đã hủy';
      case OrderStatus.RETURNED:
        return 'Đã trả hàng';
      case OrderStatus.COMPLETED:
        return 'Hoàn thành';
      default:
        return '';
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return ChipColor.PENDING;
      case OrderStatus.CONFIRMED:
        return ChipColor.CONFIRMED;
      case OrderStatus.PAID:
        return ChipColor.PAID;
      case OrderStatus.SHIPPED:
        return ChipColor.SHIPPED;
      case OrderStatus.DELIVERED:
        return ChipColor.DELIVERED;
      case OrderStatus.COMPLETED:
        return ChipColor.COMPLETED;
      case OrderStatus.CANCELLED:
        return ChipColor.CANCELLED;
      case OrderStatus.RETURNED:
        return ChipColor.RETURNED;
    }
  };

  const filteredOrders: Order[] = mockOrders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.orderStatus === filterStatus;
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.receiverName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Title title={"Quản lý đơn hàng"}/>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-grey-c200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <TextField
                // value={keyword}
                // onChange={(e) => setKeyword(e)}
                placeholder="Tìm kiếm theo tên, mô tả danh mục..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // setCurrentPage(0);
                  }
                }}
              />
            </div>

            {/* Status Filter */}
            <div className="relative min-w-[200px]">
              <DropdownSelect
                value={filterStatus}
                onChange={(value) => {
                  setFilterStatus(value);
                  // setCurrentPage(0);
                }}
                options={statusOptions}
                placeholder="Chọn trạng thái"
              />
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid gap-4 ">
          {filteredOrders.map((order) => (
            <div key={order._id}
                 className="bg-white rounded-xl shadow-sm border border-grey-c200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-5">
                {/* Order Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-grey-c800">#{order._id}</h3>
                      <Chip
                        label={getLabelStatusColor(order.orderStatus)}
                        color={getStatusColor(order.orderStatus)}
                      />
                    </div>
                    <div className="flex items-center gap-4 text-sm text-grey-c600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4"/>
                        <span>{formatDate(order.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4"/>
                        <span>{order.receiverName}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    color={ColorButton.PRIMARY}
                    startIcon={<Eye className="w-4 h-4"/>}
                    onClick={() => {
                      setSelectedOrder(order)
                      setIsOpen(true)
                    }}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center gap-2 transition-colors"
                  >

                    <span>Chi tiết</span>
                  </Button>
                </div>

                {/* Order Items */}
                <div className="space-y-3 mb-4">
                  {order.orderItems.map((item) => (
                    <div key={item._id} className="flex gap-4 p-3 bg-grey-c50 rounded-lg">
                      <img
                        src={item.productImageList[0]?.imageUrl}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-grey-c800 mb-1">{item.productName}</h4>
                        <div className="text-sm text-grey-c600 space-y-1">
                          {item.productVariants[0]?.productAttributes.map((attr, idx) => (
                            <div key={idx} className="flex gap-2">
                              <span className="text-grey-c500">{attr.attributeName}:</span>
                              <span className="font-medium">{attr.attributeValue}</span>
                            </div>
                          ))}
                          <div className="flex items-center gap-4 mt-2">
                                  <span>Số lượng: <span
                                    className="font-medium">{item.productVariants[0]?.quantity}</span></span>
                            <span
                              className="text-primary-c800 font-semibold">{formatPrice(item.productVariants[0]?.price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <Divide/>
                <div className=" flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-grey-c600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4"/>
                      <span className="max-w-xs truncate">{order.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4"/>
                      <span>{order.phoneNumber}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-grey-c600 mb-1">Tổng tiền</p>
                    <p className="text-xl font-bold text-primary-c900">{formatPrice(order.totalPrice)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && isOpen && (
        <OrderDetailModal isOpen={isOpen} setIsOpen={setIsOpen} selectedOrder={selectedOrder}/>
      )}
    </div>
  );
};
