'use client';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {useState} from "react";

export default function SearchInput() {
  const [searchValue, setSearchValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement search logic
    console.log('Searching for:', searchValue);
  };

  return (
    <div className="w-full">
      <div className={`relative flex items-center transition-all duration-200 ${
        isFocused ? 'transform scale-[1.01]' : ''
      }`}>
        <div className={`absolute inset-0 rounded-full transition-all duration-200 ${
          isFocused 
            ? 'shadow-lg shadow-primary-c300/40' 
            : 'shadow-sm shadow-grey-c200/50'
        }`}></div>

        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Tìm kiếm sản phẩm, danh mục hay thương hiệu..."
          className={`relative w-full h-12 pl-6 pr-14 text-base bg-white rounded-full 
                   outline-none transition-all duration-200
                   placeholder:text-grey-c400 font-normal
                   ${isFocused 
                     ? 'border-2 border-primary-c600' 
                     : 'border-2 border-grey-c200 hover:border-primary-c400'
                   }`}
        />

        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleSearch}
          className={`absolute right-1 w-10 h-10 flex items-center justify-center
                   rounded-full transition-all duration-200
                   ${isFocused || searchValue
                     ? 'bg-primary-c700 hover:bg-primary-c800 scale-100' 
                     : 'bg-primary-c600 hover:bg-primary-c700 scale-95'
                   }
                   active:scale-90 shadow-md hover:shadow-lg`}
        >
          <SearchRoundedIcon className="text-white !text-[22px]" />
        </button>
      </div>
    </div>
  );
}