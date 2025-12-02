import React, {useState} from 'react';
import StarIcon from '@mui/icons-material/Star';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {ProductView, ShopView} from "@/types/interface";
import {ColorButton, ProductStatus, ProductVariantStatus, RatingNumber, ShopStatus} from "@/types/enum";
import ProductCard from "@/components/user/ProductCard";
import Title from "@/libs/Title"
import {formatDate, formatNumber} from "@/util/FnCommon";
import Image from "next/image";
import Button from "@/libs/Button";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import Divide from "@/libs/Divide";
interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    imageUrl: string;
    sold: number;
    rating: number;
    stock: number;
}

// Sample Data
const sampleShop: ShopView = {
    shopId: "shop123",
    shopName: "Tech Haven Store",
    description: "Chuyên cung cấp các sản phẩm công nghệ chính hãng, uy tín hàng đầu Việt Nam",
    logoUrl: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=200&h=200&fit=crop",
    bannerUrl: "https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=300&fit=crop",
    shopStatus: ShopStatus.ACTIVE,
    ownerId: "owner123",
    province: "Hà Nội",
    ward: "Phường Cầu Giấy",
    detail: "Số 123, Đường Láng",
    phoneNumber: "0987654321",
    totalProducts: 245,
    activeProducts: 230,
    totalSold: 15420,
    totalRevenue: 2450000000,
    rating: 4.8,
    numberOfRatings: 3250,
    numberOfReviews: 1890,
    createdAt: "2022-01-15T10:30:00Z",
    updatedAt: "2024-12-01T15:45:00Z"
};

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


type Props = {
    id: string;
};
export default function Main({id}: Props) {
    const [shop] = useState<ShopView>(sampleShop);

    return (
        <div className="">
            {/* Shop Info Card */}
            <div className="bg-white shadow-sm">
                {/* Banner */}
                <div className="relative h-48 md:h-64 overflow-hidden">
                    <Image
                        src={shop.bannerUrl || "/imageBanner.jpg"}
                        alt={shop.shopName}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                    />
                </div>

                {/* Shop Header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative pb-6">
                        {/* Logo */}
                        <div className="absolute -top-12 left-0">
                            <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                                <Image
                                    src={shop.logoUrl}
                                    alt={shop.shopName}
                                    width={96}
                                    height={96}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Shop Name & Status */}
                        <div className="pt-16">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h1 className="text-2xl font-bold text-grey-c900">{shop.shopName}</h1>
                                    </div>
                                    <p className="mt-2 text-grey-c600">{shop.description}</p>
                                </div>
                                <Button
                                    color={ColorButton.PRIMARY}
                                    startIcon={<ChatBubbleOutlineIcon className=""/>}>
                                    Chat ngay
                                </Button>
                            </div>

                            {/* Shop Stats */}
                            <div className="flex flex-wrap items-center gap-8 mt-6 py-4 border-t border-b border-grey-c200">
                                <div className="flex items-center gap-2">
                                    <Inventory2Icon className="w-5 h-5 text-primary-c500" />
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm text-grey-c600">Sản phẩm:</span>
                                        <span className="text-base font-semibold text-grey-c900">{shop.activeProducts}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <TrendingUpIcon className="w-5 h-5 text-primary-c500" />
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm text-grey-c600">Đã bán:</span>
                                        <span className="text-base font-semibold text-grey-c900">{formatNumber(shop.totalSold)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <StarIcon className="w-5 h-5 text-yellow-500" />
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm text-grey-c600">Đánh giá:</span>
                                        <span className="text-base font-semibold text-grey-c900">
                                            {shop.rating}/5 ({formatNumber(shop.numberOfRatings)})
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <CalendarTodayIcon className="w-5 h-5 text-primary-c500" />
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-sm text-grey-c600">Tham gia:</span>
                                        <span className="text-base font-semibold text-grey-c900">{formatDate(shop.createdAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="flex flex-wrap gap-6 mt-6 pb-4">
                                <div className="flex items-center gap-2 text-grey-c600">
                                    <LocationOnIcon className="w-4 h-4" />
                                    <span className="text-sm">{shop.detail}, {shop.ward}, {shop.province}</span>
                                </div>
                                <div className="flex items-center gap-2 text-grey-c600">
                                    <PhoneIcon className="w-4 h-4" />
                                    <span className="text-sm">{shop.phoneNumber}</span>
                                </div>
                            </div>
                            <Divide/>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Title title={"Sản phẩm của shop"}/>

                <div
                    className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-6`}>
                    {sampleProducts.map(product => (
                        <ProductCard product={product} key={product.productId}/>
                    ))}
                </div>
            </div>
        </div>
    );
};
