"use client";

import React, {useState} from 'react';
import StarRateRoundedIcon from '@mui/icons-material/StarRateRounded';
import ArrowRightAltRoundedIcon from '@mui/icons-material/ArrowRightAltRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import Button from "@/libs/Button";
import {ColorButton, ProductStatus, ProductVariantStatus, RatingNumber, ShopStatus} from "@/types/enum";
import DropdownSelect from "@/libs/DropdownSelect";
import ProductCard from "@/components/user/ProductCard";
import {ProductView} from "@/types/interface";
import TextField from "@/libs/TextField";

export const sampleProducts: ProductView[] = [
  // iPhone 15 Pro Max
  {
    productId: "prod_001",
    shopId: "shop_apple_official",
    rating: 3,
    numberOfRatings: 420,
    numberOfReviews: 420,
    ratingStatistics: {
      [RatingNumber.ONE]: 10,
      [RatingNumber.TWO]: 20,
      [RatingNumber.THREE]: 100,
      [RatingNumber.FOUR]: 150,
      [RatingNumber.FIVE]: 140
    },
    name: "iPhone 15 Pro Max",
    description: "iPhone 15 Pro Max với chip A17 Pro mạnh mẽ, camera 48MP, khung titan cao cấp và màn hình Super Retina XDR 6.7 inch. Hỗ trợ USB-C và Action Button hoàn toàn mới.",
    productStatus: ProductStatus.ACTIVE,
    totalSold: 1250,
    discount: 10,
    discountStartDate: "2024-12-01T00:00:00Z",
    discountEndDate: "2025-12-31T23:59:59Z",
    categoryId: "cat_001",
    categoryName: "Điện thoại",
    shopStatus: ShopStatus.ACTIVE,
    productImages: [
      {
        productImageId: "img_001_1",
        imageUrl: "https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-max-blue-1.png"
      },
      {
        productImageId: "img_001_2",
        imageUrl: "https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-max-white-1.png"
      },
      {
        productImageId: "img_001_3",
        imageUrl: "https://cdn.hoanghamobile.com/i/productlist/dsp/Uploads/2023/09/13/iphone-15-pro-max-black-1.png"
      }
    ],
    productAttributes: [
      {
        productAttributeId: "attr_color",
        productAttributeName: "Màu sắc",
        productAttributeValues: [
          {productAttributeValueId: "val_color_1", productAttributeValue: "Titan Tự Nhiên"},
          {productAttributeValueId: "val_color_2", productAttributeValue: "Titan Xanh"},
          {productAttributeValueId: "val_color_3", productAttributeValue: "Titan Trắng"},
          {productAttributeValueId: "val_color_4", productAttributeValue: "Titan Đen"}
        ]
      },
      {
        productAttributeId: "attr_storage",
        productAttributeName: "Dung lượng",
        productAttributeValues: [
          {productAttributeValueId: "val_storage_1", productAttributeValue: "256GB"},
          {productAttributeValueId: "val_storage_2", productAttributeValue: "512GB"},
          {productAttributeValueId: "val_storage_3", productAttributeValue: "1TB"}
        ]
      }
    ],
    productVariants: [
      {
        productVariantId: "var_001_1",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 29990000,
        stockQuantity: 45,
        sold: 120,
        isDefault: true,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_001_1",
            productAttributeId: "attr_color",
            productAttributeValueId: "val_color_1"
          },
          {
            productVariantAttributeValueId: "vav_001_2",
            productAttributeId: "attr_storage",
            productAttributeValueId: "val_storage_1"
          }
        ]
      },
      {
        productVariantId: "var_001_2",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 34990000,
        stockQuantity: 30,
        sold: 95,
        isDefault: false,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_001_3",
            productAttributeId: "attr_color",
            productAttributeValueId: "val_color_2"
          },
          {
            productVariantAttributeValueId: "vav_001_4",
            productAttributeId: "attr_storage",
            productAttributeValueId: "val_storage_2"
          }
        ]
      },
      {
        productVariantId: "var_001_3",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 39990000,
        stockQuantity: 15,
        sold: 48,
        isDefault: false,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_001_5",
            productAttributeId: "attr_color",
            productAttributeValueId: "val_color_3"
          },
          {
            productVariantAttributeValueId: "vav_001_6",
            productAttributeId: "attr_storage",
            productAttributeValueId: "val_storage_3"
          }
        ]
      }
    ],
    createdAt: "2024-09-15T10:00:00Z",
    updatedAt: "2024-12-01T08:30:00Z"
  },

  // Samsung Galaxy S24 Ultra
  {
    productId: "prod_002",
    shopId: "shop_samsung_official",
    rating: 4.7,
    numberOfRatings: 298,
    numberOfReviews: 298,
    ratingStatistics: {
      [RatingNumber.ONE]: 5,
      [RatingNumber.TWO]: 10,
      [RatingNumber.THREE]: 20,
      [RatingNumber.FOUR]: 100,
      [RatingNumber.FIVE]: 163
    },
    name: "Samsung Galaxy S24 Ultra",
    description: "Galaxy S24 Ultra với bút S Pen tích hợp, camera 200MP, chip Snapdragon 8 Gen 3 for Galaxy, màn hình Dynamic AMOLED 2X 6.8 inch. Hỗ trợ Galaxy AI thông minh.",
    productStatus: ProductStatus.ACTIVE,
    totalSold: 980,
    discount: null,
    discountStartDate: null,
    discountEndDate: null,
    categoryId: "cat_001",
    categoryName: "Điện thoại",
    shopStatus: ShopStatus.ACTIVE,
    productImages: [
      {
        productImageId: "img_002_1",
        imageUrl: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltxipthba13z82@resize_w82_nl"
      },
      {
        productImageId: "img_002_2",
        imageUrl: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltxipthba13z82@resize_w164_nl"
      },
      {
        productImageId: "img_002_3",
        imageUrl: "https://down-vn.img.susercontent.com/file/vn-11134207-7r98o-ltxipthba13z82@resize_w164_nl"
      }
    ],
    productAttributes: [
      {
        productAttributeId: "attr_color_s24",
        productAttributeName: "Màu sắc",
        productAttributeValues: [
          {productAttributeValueId: "val_color_s24_1", productAttributeValue: "Titan Xám"},
          {productAttributeValueId: "val_color_s24_2", productAttributeValue: "Titan Đen"},
          {productAttributeValueId: "val_color_s24_3", productAttributeValue: "Titan Tím"},
          {productAttributeValueId: "val_color_s24_4", productAttributeValue: "Titan Vàng"}
        ]
      },
      {
        productAttributeId: "attr_storage_s24",
        productAttributeName: "Dung lượng",
        productAttributeValues: [
          {productAttributeValueId: "val_storage_s24_1", productAttributeValue: "256GB"},
          {productAttributeValueId: "val_storage_s24_2", productAttributeValue: "512GB"},
          {productAttributeValueId: "val_storage_s24_3", productAttributeValue: "1TB"}
        ]
      }
    ],
    productVariants: [
      {
        productVariantId: "var_002_1",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 26990000,
        stockQuantity: 60,
        sold: 180,
        isDefault: true,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_002_1",
            productAttributeId: "attr_color_s24",
            productAttributeValueId: "val_color_s24_1"
          },
          {
            productVariantAttributeValueId: "vav_002_2",
            productAttributeId: "attr_storage_s24",
            productAttributeValueId: "val_storage_s24_1"
          }
        ]
      },
      {
        productVariantId: "var_002_2",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 29990000,
        stockQuantity: 40,
        sold: 120,
        isDefault: false,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_002_3",
            productAttributeId: "attr_color_s24",
            productAttributeValueId: "val_color_s24_2"
          },
          {
            productVariantAttributeValueId: "vav_002_4",
            productAttributeId: "attr_storage_s24",
            productAttributeValueId: "val_storage_s24_2"
          }
        ]
      }
    ],
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-11-15T14:20:00Z"
  },

  // MacBook Pro 14 M3
  {
    productId: "prod_003",
    shopId: "shop_apple_official",
    rating: 4.9,
    numberOfRatings: 210,
    numberOfReviews: 210,
    ratingStatistics: {
      [RatingNumber.ONE]: 2,
      [RatingNumber.TWO]: 3,
      [RatingNumber.THREE]: 10,
      [RatingNumber.FOUR]: 45,
      [RatingNumber.FIVE]: 150
    },
    name: "MacBook Pro 14 inch M3",
    description: "MacBook Pro 14 inch với chip M3 mạnh mẽ, màn hình Liquid Retina XDR, thời lượng pin lên đến 22 giờ. Thiết kế nhôm cao cấp với bàn phím Magic Keyboard và Touch ID.",
    productStatus: ProductStatus.ACTIVE,
    totalSold: 750,
    discount: 5,
    discountStartDate: "2024-12-15T00:00:00Z",
    discountEndDate: "2024-12-25T23:59:59Z",
    categoryId: "cat_002",
    categoryName: "Laptop",
    shopStatus: ShopStatus.ACTIVE,
    productImages: [
      {
        productImageId: "img_003_1",
        imageUrl: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spacegray-select-202310.png"
      },
      {
        productImageId: "img_003_2",
        imageUrl: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-silver-select-202310.png"
      }
    ],
    productAttributes: [
      {
        productAttributeId: "attr_color_mbp",
        productAttributeName: "Màu sắc",
        productAttributeValues: [
          {productAttributeValueId: "val_color_mbp_1", productAttributeValue: "Xám Không Gian"},
          {productAttributeValueId: "val_color_mbp_2", productAttributeValue: "Bạc"}
        ]
      },
      {
        productAttributeId: "attr_ram_mbp",
        productAttributeName: "RAM",
        productAttributeValues: [
          {productAttributeValueId: "val_ram_mbp_1", productAttributeValue: "8GB"},
          {productAttributeValueId: "val_ram_mbp_2", productAttributeValue: "16GB"},
          {productAttributeValueId: "val_ram_mbp_3", productAttributeValue: "32GB"}
        ]
      },
      {
        productAttributeId: "attr_ssd_mbp",
        productAttributeName: "SSD",
        productAttributeValues: [
          {productAttributeValueId: "val_ssd_mbp_1", productAttributeValue: "512GB"},
          {productAttributeValueId: "val_ssd_mbp_2", productAttributeValue: "1TB"},
          {productAttributeValueId: "val_ssd_mbp_3", productAttributeValue: "2TB"}
        ]
      }
    ],
    productVariants: [
      {
        productVariantId: "var_003_1",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 41990000,
        stockQuantity: 25,
        sold: 85,
        isDefault: true,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_003_1",
            productAttributeId: "attr_color_mbp",
            productAttributeValueId: "val_color_mbp_1"
          },
          {
            productVariantAttributeValueId: "vav_003_2",
            productAttributeId: "attr_ram_mbp",
            productAttributeValueId: "val_ram_mbp_2"
          },
          {
            productVariantAttributeValueId: "vav_003_3",
            productAttributeId: "attr_ssd_mbp",
            productAttributeValueId: "val_ssd_mbp_1"
          }
        ]
      },
      {
        productVariantId: "var_003_2",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 49990000,
        stockQuantity: 18,
        sold: 62,
        isDefault: false,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_003_4",
            productAttributeId: "attr_color_mbp",
            productAttributeValueId: "val_color_mbp_2"
          },
          {
            productVariantAttributeValueId: "vav_003_5",
            productAttributeId: "attr_ram_mbp",
            productAttributeValueId: "val_ram_mbp_2"
          },
          {
            productVariantAttributeValueId: "vav_003_6",
            productAttributeId: "attr_ssd_mbp",
            productAttributeValueId: "val_ssd_mbp_2"
          }
        ]
      },
      {
        productVariantId: "var_003_3",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 59990000,
        stockQuantity: 10,
        sold: 28,
        isDefault: false,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_003_7",
            productAttributeId: "attr_color_mbp",
            productAttributeValueId: "val_color_mbp_1"
          },
          {
            productVariantAttributeValueId: "vav_003_8",
            productAttributeId: "attr_ram_mbp",
            productAttributeValueId: "val_ram_mbp_3"
          },
          {
            productVariantAttributeValueId: "vav_003_9",
            productAttributeId: "attr_ssd_mbp",
            productAttributeValueId: "val_ssd_mbp_2"
          }
        ]
      }
    ],
    createdAt: "2023-11-10T10:00:00Z",
    updatedAt: "2024-12-10T09:15:00Z"
  },

  // AirPods Pro 2
  {
    productId: "prod_004",
    shopId: "shop_apple_official",
    rating: 4.8,
    numberOfRatings: 640,
    numberOfReviews: 640,
    ratingStatistics: {
      [RatingNumber.ONE]: 10,
      [RatingNumber.TWO]: 15,
      [RatingNumber.THREE]: 40,
      [RatingNumber.FOUR]: 200,
      [RatingNumber.FIVE]: 375
    },
    name: "AirPods Pro 2 (USB-C)",
    description: "AirPods Pro thế hệ 2 với chip H2, chống ồn chủ động gấp đôi, âm thanh thích ứng, âm thanh không gian cá nhân hóa. Hộp sạc USB-C hỗ trợ sạc MagSafe và Qi.",
    productStatus: ProductStatus.ACTIVE,
    totalSold: 2100,
    discount: null,
    discountStartDate: null,
    discountEndDate: null,
    categoryId: "cat_003",
    categoryName: "Tai nghe",
    shopStatus: ShopStatus.ACTIVE,
    productImages: [
      {
        productImageId: "img_004_1",
        imageUrl: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MQD83.png"
      },
      {
        productImageId: "img_004_2",
        imageUrl: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/airpods-pro-2-gallery-1.png"
      }
    ],
    productAttributes: [
      {
        productAttributeId: "attr_type_airpods",
        productAttributeName: "Loại",
        productAttributeValues: [
          {productAttributeValueId: "val_type_1", productAttributeValue: "Standard"}
        ]
      }
    ],
    productVariants: [
      {
        productVariantId: "var_004_1",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 6490000,
        stockQuantity: 150,
        sold: 520,
        isDefault: true,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_004_1",
            productAttributeId: "attr_type_airpods",
            productAttributeValueId: "val_type_1"
          }
        ]
      }
    ],
    createdAt: "2023-09-20T10:00:00Z",
    updatedAt: "2024-11-28T16:45:00Z"
  },

  // Sony WH-1000XM5
  {
    productId: "prod_005",
    shopId: "shop_sony_official",
    rating: 4.9,
    numberOfRatings: 520,
    numberOfReviews: 520,
    ratingStatistics: {
      [RatingNumber.ONE]: 3,
      [RatingNumber.TWO]: 5,
      [RatingNumber.THREE]: 12,
      [RatingNumber.FOUR]: 100,
      [RatingNumber.FIVE]: 400
    },
    name: "Sony WH-1000XM5",
    description: "Tai nghe chống ồn hàng đầu với 8 micro, chống ồn thông minh tự động điều chỉnh, âm thanh Hi-Res, thời lượng pin 30 giờ, sạc nhanh 3 phút cho 3 giờ nghe nhạc.",
    productStatus: ProductStatus.ACTIVE,
    totalSold: 1680,
    discount: 15,
    discountStartDate: "2024-11-01T00:00:00Z",
    discountEndDate: "2024-12-31T23:59:59Z",
    categoryId: "cat_003",
    categoryName: "Tai nghe",
    shopStatus: ShopStatus.ACTIVE,
    productImages: [
      {
        productImageId: "img_005_1",
        imageUrl: "https://www.sony.com.vn/image/5d02da5d0e64fbf38c85015420c49d0f?fmt=pjpeg&wid=330&hei=330"
      },
      {
        productImageId: "img_005_2",
        imageUrl: "https://www.sony.com.vn/image/3c061ee95c247c9f5f2e5bb1a4a0cfa5?fmt=pjpeg&wid=330&hei=330"
      }
    ],
    productAttributes: [
      {
        productAttributeId: "attr_color_sony",
        productAttributeName: "Màu sắc",
        productAttributeValues: [
          {productAttributeValueId: "val_color_sony_1", productAttributeValue: "Đen"},
          {productAttributeValueId: "val_color_sony_2", productAttributeValue: "Bạc"},
          {productAttributeValueId: "val_color_sony_3", productAttributeValue: "Xanh Midnight"}
        ]
      }
    ],
    productVariants: [
      {
        productVariantId: "var_005_1",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 8990000,
        stockQuantity: 80,
        sold: 680,
        isDefault: true,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_005_1",
            productAttributeId: "attr_color_sony",
            productAttributeValueId: "val_color_sony_1"
          }
        ]
      },
      {
        productVariantId: "var_005_2",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 8990000,
        stockQuantity: 45,
        sold: 420,
        isDefault: false,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_005_2",
            productAttributeId: "attr_color_sony",
            productAttributeValueId: "val_color_sony_2"
          }
        ]
      }
    ],
    createdAt: "2023-05-15T10:00:00Z",
    updatedAt: "2024-11-20T11:30:00Z"
  },

  // iPad Air M2
  {
    productId: "prod_006",
    shopId: "shop_apple_official",
    rating: 4.7,
    numberOfRatings: 310,
    numberOfReviews: 310,
    ratingStatistics: {
      [RatingNumber.ONE]: 8,
      [RatingNumber.TWO]: 12,
      [RatingNumber.THREE]: 30,
      [RatingNumber.FOUR]: 120,
      [RatingNumber.FIVE]: 140
    },
    name: "iPad Air M2 11 inch",
    description: "iPad Air với chip M2 mạnh mẽ, màn hình Liquid Retina 11 inch, hỗ trợ Apple Pencil Pro và Magic Keyboard. Thiết kế mỏng nhẹ với 4 màu sắc thời trang.",
    productStatus: ProductStatus.ACTIVE,
    totalSold: 890,
    discount: null,
    discountStartDate: null,
    discountEndDate: null,
    categoryId: "cat_004",
    categoryName: "Máy tính bảng",
    shopStatus: ShopStatus.ACTIVE,
    productImages: [
      {
        productImageId: "img_006_1",
        imageUrl: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/ipad-air-finish-select-202405-11inch-blue.png"
      },
      {
        productImageId: "img_006_2",
        imageUrl: "https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/ipad-air-finish-select-202405-11inch-purple.png"
      }
    ],
    productAttributes: [
      {
        productAttributeId: "attr_color_ipad",
        productAttributeName: "Màu sắc",
        productAttributeValues: [
          {productAttributeValueId: "val_color_ipad_1", productAttributeValue: "Xanh Dương"},
          {productAttributeValueId: "val_color_ipad_2", productAttributeValue: "Tím"},
          {productAttributeValueId: "val_color_ipad_3", productAttributeValue: "Trắng Sao"},
          {productAttributeValueId: "val_color_ipad_4", productAttributeValue: "Xám Không Gian"}
        ]
      },
      {
        productAttributeId: "attr_storage_ipad",
        productAttributeName: "Dung lượng",
        productAttributeValues: [
          {productAttributeValueId: "val_storage_ipad_1", productAttributeValue: "128GB"},
          {productAttributeValueId: "val_storage_ipad_2", productAttributeValue: "256GB"},
          {productAttributeValueId: "val_storage_ipad_3", productAttributeValue: "512GB"}
        ]
      },
      {
        productAttributeId: "attr_connectivity_ipad",
        productAttributeName: "Kết nối",
        productAttributeValues: [
          {productAttributeValueId: "val_conn_ipad_1", productAttributeValue: "Wi-Fi"},
          {productAttributeValueId: "val_conn_ipad_2", productAttributeValue: "Wi-Fi + Cellular"}
        ]
      }
    ],
    productVariants: [
      {
        productVariantId: "var_006_1",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 15990000,
        stockQuantity: 55,
        sold: 245,
        isDefault: true,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_006_1",
            productAttributeId: "attr_color_ipad",
            productAttributeValueId: "val_color_ipad_1"
          },
          {
            productVariantAttributeValueId: "vav_006_2",
            productAttributeId: "attr_storage_ipad",
            productAttributeValueId: "val_storage_ipad_1"
          },
          {
            productVariantAttributeValueId: "vav_006_3",
            productAttributeId: "attr_connectivity_ipad",
            productAttributeValueId: "val_conn_ipad_1"
          }
        ]
      },
      {
        productVariantId: "var_006_2",
        productVariantStatus: ProductVariantStatus.ACTIVE,
        price: 19990000,
        stockQuantity: 35,
        sold: 180,
        isDefault: false,
        productVariantAttributeValues: [
          {
            productVariantAttributeValueId: "vav_006_4",
            productAttributeId: "attr_color_ipad",
            productAttributeValueId: "val_color_ipad_2"
          },
          {
            productVariantAttributeValueId: "vav_006_5",
            productAttributeId: "attr_storage_ipad",
            productAttributeValueId: "val_storage_ipad_2"
          },
          {
            productVariantAttributeValueId: "vav_006_6",
            productAttributeId: "attr_connectivity_ipad",
            productAttributeValueId: "val_conn_ipad_1"
          }
        ]
      }
    ],
    createdAt: "2024-05-10T10:00:00Z",
    updatedAt: "2024-11-25T13:20:00Z"
  }
];


type Filters = {
  category: string[];
  priceRange: [number, number];
  minRating: number;
};

type FilterKey = keyof Filters;

const options: Option[] = [
  {id: "popular", label: "Phổ biến nhất"},
  {id: "newest", label: "Mới nhất"},
  {id: "price-asc", label: "Giá thấp đến cao"},
  {id: "price-desc", label: "Giá cao đến thấp"},
  {id: "rating", label: "Đánh giá cao nhất"},
];


export default function Search() {
  const [, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(true);

  // Bộ lọc
  const [filters, setFilters] = useState<Filters>({
    category: [],
    priceRange: [0, 50000000],
    minRating: 0,
  });

  // Lấy danh sách unique categories và brands
  const categories = [...new Set(sampleProducts.map(p => p.categoryName))];

  const handleFilterChange = (type: FilterKey, value: string | [number, number] | number) => {
    setFilters((prev: Filters) => {
      if (type === 'priceRange') {
        return {...prev, priceRange: value as [number, number]};
      }
      if (type === 'minRating') {
        return {...prev, minRating: value as number};
      }
      // default: category toggle (type === 'category')
      const current = prev.category;
      const val = value as string;
      const updated = current.includes(val) ? current.filter(v => v !== val) : [...current, val];
      return {...prev, category: updated};
    });
  };

  const clearFilter = (type: FilterKey | 'all', value?: string | [number, number] | number) => {
    if (type === 'all') {
      setFilters({
        category: [],
        priceRange: [0, 50000000],
        minRating: 0,
      });
    } else {
      // reuse handleFilterChange to toggle/remove a specific filter
      handleFilterChange(type as FilterKey, (value ?? '') as string | [number, number] | number);
    }
  };
  const activeFiltersCount =
    filters.category.length +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 50000000 ? 1 : 0);

  return (


    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6 flex-row">
        {/* Sidebar bộ lọc */}
        <div
          className={`${showFilters ? 'w-64 opacity-100' : 'w-0 opacity-0'} transition-all duration-300 overflow-hidden`}>
          <div className="bg-white p-4 rounded-lg shadow hover:shadow-xl transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg text-grey-c700 h-9">Bộ lọc</h3>
              {activeFiltersCount > 0 && (
                <Button
                  color={ColorButton.PRIMARY}
                  type={"button"}
                  onClick={() => clearFilter('all')}
                  className="text-sm"
                >
                  Xóa tất cả
                </Button>
              )}
            </div>

            <div className={"flex gap-6 flex-col"}>
              {/* Lọc theo danh mục */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-grey-c800">Danh mục</h4>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <div className="flex flex-wrap gap-2">
                    {categories.map(cat => {
                      const active = filters.category.includes(cat);
                      return (
                        <button
                          key={cat}
                          onClick={() => handleFilterChange('category', cat)}
                          className={`cursor-pointer text-sm px-3 py-1 rounded-full border transition-all ${active ? 'bg-primary-c100 text-primary-c700 border-primary-c200 ' : 'bg-white text-grey-c700 hover:bg-grey-c50 border-grey-c500'}`}
                          aria-pressed={active}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              {/* Lọc theo số sao */}
              <div>
                <h4 className="font-medium text-grey-c800 mb-3">Đánh giá</h4>
                {(Object.values(RatingNumber).reverse().filter(v => typeof v === 'number') as number[]).map((rating: number)  => (
                  <button
                    key={rating}
                    onClick={() => handleFilterChange('minRating', filters.minRating === rating ? 0 : rating)}
                    className={`w-full flex items-center mb-2 p-2 rounded cursor-pointer transition-all ${
                      filters.minRating === rating ? 'bg-primary-c100 text-primary-c700 border-primary-c200' : 'bg-white text-grey-c700 hover:bg-grey-c50 border-grey-c500'
                    } border`}
                  >
                    {
                      Array.from({length: 5}, (_, index) => (
                        <StarRateRoundedIcon
                          key={index}
                          className={`!w-4 !h-4 ${
                            index < rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))
                    }
                    <span className="text-sm">{rating} trở lên</span>
                  </button>
                ))}
              </div>
              {/* Lọc theo khoảng giá */}
              <div>
                <h4 className="font-medium text-grey-c800 mb-3">Khoảng giá</h4>
                <div className={"flex gap-1 items-center mb-3"}>
                  <TextField
                    placeholder={"Từ"}
                    className={"!p-2 !rounded-xl"}
                  />
                  <ArrowRightAltRoundedIcon className={"text-primary-c700"}/>
                  <TextField
                    placeholder={"Đến"}
                    className={"!p-2 !rounded-xl"}
                  />
                </div>
                <Button
                  color={ColorButton.PRIMARY}
                  fullWidth={true}
                  startIcon={<FilterAltRoundedIcon/>}>
                  Áp dụng
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-row justify-between gap-4">
              <div className={"flex flex-row flex-1 items-center gap-2"}>
                <Button
                  type="button"
                  color={ColorButton.PRIMARY}
                  onClick={() => setShowFilters(!showFilters)}
                  startIcon={<TuneRoundedIcon/>}
                  className="flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50"
                >
                  <span className="text-sm">
                      Bộ lọc {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                    </span>
                </Button>
                <span className="text-sm text-grey-c700">
                    Tìm thấy <strong>{sampleProducts.length}</strong> sản phẩm
                  </span>
              </div>
              {/* Sắp xếp */}
              <div>
                <DropdownSelect
                  label={"Sắp xếp theo"}
                  value={sortBy}
                  options={options}
                  onChange={(e) => setSortBy(e)}
                />
              </div>
            </div>


          </div>
          {/* Hiển thị sản phẩm */}
          {sampleProducts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-gray-600 mb-4">Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  clearFilter('all');
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-1 md:grid-cols-3 ${showFilters ? 'lg:grid-cols-4' : 'lg:grid-cols-5'} gap-4`}>
              {sampleProducts.map(product => (
                <ProductCard product={product} key={product.productId}/>
              ))}
            </div>
          )}</div>
      </div>
    </div>
  );
}