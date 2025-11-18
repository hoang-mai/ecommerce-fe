'use client';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

import {formatPrice} from "@/util/FnCommon";
import Button from "@/libs/Button";
import {ColorButton} from "@/enum";
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import {useRef} from "react";
import {ProductCard} from "@/components/user/ProductCard";

export default function Main() {
  const products = [
    {
      id: 1,
      name: 'iPhone 15 Pro Maxaaaaaaaaaaaaaaaaa',
      price: 29990000,
      originalPrice: 32990000,
      image: 'https://images.unsplash.com/photo-1696446702691-aaad85355b52?w=400&h=400&fit=crop',
      category: 'Điện thoại',
      rating: 4.8,
      sold: 2341,
      discount: 9
    },
    {
      id: 2,
      name: 'MacBook Air M3',
      price: 27990000,
      originalPrice: 31990000,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop',
      category: 'Laptop',
      rating: 4.9,
      sold: 1523,
      discount: 13
    },
    {
      id: 3,
      name: 'iPad Pro 12.9 inch',
      price: 24990000,
      originalPrice: 28990000,
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop',
      category: 'Máy tính bảng',
      rating: 4.7,
      sold: 892,
      discount: 14
    },
    {
      id: 4,
      name: 'Samsung Galaxy S24 Ultra',
      price: 26990000,
      originalPrice: 29990000,
      image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop',
      category: 'Điện thoại',
      rating: 4.6,
      sold: 1678,
      discount: 10
    },
    {
      id: 5,
      name: 'AirPods Pro 2',
      price: 5490000,
      originalPrice: 6490000,
      image: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop',
      category: 'Tai nghe',
      rating: 4.8,
      sold: 3421,
      discount: 15
    },
    {
      id: 6,
      name: 'Dell XPS 15',
      price: 32990000,
      originalPrice: 37990000,
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&h=400&fit=crop',
      category: 'Laptop',
      rating: 4.7,
      sold: 743,
      discount: 13
    },
    {
      id: 7,
      name: 'Apple Watch Series 9',
      price: 9990000,
      originalPrice: 11990000,
      image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=400&h=400&fit=crop',
      category: 'Đồng hồ thông minh',
      rating: 4.9,
      sold: 2156,
      discount: 17
    },
    {
      id: 8,
      name: 'Sony WH-1000XM5',
      price: 7490000,
      originalPrice: 8990000,
      image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400&h=400&fit=crop',
      category: 'Tai nghe',
      rating: 4.8,
      sold: 1432,
      discount: 17
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map(product => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </div>
  );
}