import React, { useEffect, useRef, useState, KeyboardEvent } from "react";

export type TabItem = {
  key: string;
  label?: React.ReactNode;
  disabled?: boolean;
  [k: string]: unknown;
};

type Props = {
  items: TabItem[];
  activeKey?: string;
  onChange?: (key: string) => void;
  renderItem?: (item: TabItem, isActive: boolean) => React.ReactNode;
  className?: string;
  tabClassName?: string;
  scrollStep?: number;
};

export default function ScrollTab({
  items,
  activeKey,
  onChange,
  renderItem,
  className = "",
  tabClassName = "",
  scrollStep = 200,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [indicator, setIndicator] = useState<{ left: number; width: number; visible: boolean }>({
    left: 0,
    width: 0,
    visible: false,
  });
  const rafRef = useRef<number | null>(null);

  // update scroll buttons availability
  const updateScrollState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    // use a small threshold to avoid fractional-layout noise
    const threshold = 0.5;
    setCanScrollLeft(el.scrollLeft > threshold);
    setCanScrollRight(el.scrollWidth - el.clientWidth - el.scrollLeft > threshold);
  };

  useEffect(() => {
    // ensure we compute initial state shortly after mount or when items change
    const t = window.setTimeout(() => updateScrollState(), 50);
    const onResize = () => updateScrollState();
    window.addEventListener("resize", onResize);
    // also observe size changes of the scroller content (images, dynamic children)
    let ro: ResizeObserver | null = null;
    const el = scrollerRef.current;
    if (typeof ResizeObserver !== "undefined" && el) {
      ro = new ResizeObserver(() => updateScrollState());
      ro.observe(el);
      // observe children as well
      Array.from(el.children).forEach((child) => ro?.observe(child as Element));
    }
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
      if (ro) {
        try {
          ro.disconnect();
        } catch  {

        }
      }
    };
  }, [items]);

  // scroll helpers
  const scrollBy = (distance: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: distance, behavior: "smooth" });
  };

  // scroll to active on mount or when activeKey changes
  useEffect(() => {
    // Update indicator position/size and ensure active tab is visible.
    const update = () => {
      const el = scrollerRef.current;
      if (!el || activeKey == null) {
        setIndicator((s) => (s.visible ? { left: 0, width: 0, visible: false } : s));
        return;
      }

      const activeEl = el.querySelector<HTMLElement>(`[data-tab-key="${activeKey}"]`);
      if (!activeEl) {
        setIndicator((s) => (s.visible ? { left: 0, width: 0, visible: false } : s));
        return;
      }

      // Ensure the active item is fully visible (scroll it into view if needed)
      const threshold = 0.5; // keep in sync with updateScrollState
      const parentRect = el.getBoundingClientRect();
      const childRect = activeEl.getBoundingClientRect();
      const isOverflowing = el.scrollWidth > el.clientWidth + threshold;
      if (isOverflowing) {
        if (childRect.left < parentRect.left) {
          const dx = childRect.left - parentRect.left - 8;
          el.scrollBy({ left: dx, behavior: "smooth" });
        } else if (childRect.right > parentRect.right) {
          const dx = childRect.right - parentRect.right + 8;
          el.scrollBy({ left: dx, behavior: "smooth" });
        }
      }

      // Compute left relative to scroller content
      const left = (activeEl as HTMLElement).offsetLeft - el.scrollLeft;
      const width = (activeEl as HTMLElement).offsetWidth;
      setIndicator({ left, width, visible: true });
      // Update scroll button visibility in case sizes changed
      updateScrollState();
    };

    // Small timeout to wait for layout settle (e.g., initial render)
    const t = window.setTimeout(() => update(), 30);

    // Also update on scroll/resize using RAF for smooth updates
    const el = scrollerRef.current;
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => update());
    };
    const onResize = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => update());
    };
    // observe size changes to active element or its siblings
    let ro2: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && el) {
      ro2 = new ResizeObserver(() => update());
      // observe the content container
      const content = el.querySelector("div");
      if (content) {
        ro2.observe(content as Element);
      }
    }

    el?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(t);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      el?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (ro2) {
        try {
          ro2.disconnect();
        } catch {

        }
      }
    };
  }, [activeKey, items]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const key = e.key;
    const enabledItems = items.filter((it) => !it.disabled);
    if (enabledItems.length === 0) return;
    const currentIndex = enabledItems.findIndex((it) => it.key === activeKey);
    let nextIndex = -1;

    if (key === "ArrowRight") {
      e.preventDefault();
      nextIndex = Math.min(enabledItems.length - 1, (currentIndex === -1 ? -1 : currentIndex) + 1);
    } else if (key === "ArrowLeft") {
      e.preventDefault();
      nextIndex = Math.max(0, (currentIndex === -1 ? 0 : currentIndex) - 1);
    } else if (key === "Home") {
      e.preventDefault();
      nextIndex = 0;
    } else if (key === "End") {
      e.preventDefault();
      nextIndex = enabledItems.length - 1;
    }

    if (nextIndex >= 0 && nextIndex < enabledItems.length) {
      const next = enabledItems[nextIndex];
      onChange?.(next.key);
      // scroll that item into view
      const el = scrollerRef.current;
      if (el) {
        const node = el.querySelector<HTMLElement>(`[data-tab-key=\"${next.key}\"]`);
        node?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  };

  const defaultRender = (item: TabItem, isActive: boolean) => (
    <button
      type="button"
      data-tab-key={item.key}
      role="tab"
      aria-selected={isActive}
      aria-disabled={item.disabled || undefined}
      onClick={() => !item.disabled && onChange?.(item.key)}
      className={`cursor-pointer whitespace-nowrap px-2 pb-2 pt-2 min-w-[40px] text-sm font-medium transition-colors duration-150 ${
        isActive
          ? "text-primary-c600"
          : item.disabled
          ? "text-grey-c400 cursor-not-allowed"
          : "text-primary-c900 hover:text-primary-c700"
      } ${tabClassName}`}
      disabled={item.disabled}
    >
      {item.label}
    </button>
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          type="button"
          aria-hidden={!canScrollLeft}
          onClick={() => scrollBy(-scrollStep)}
          tabIndex={0}
          className={`p-2 rounded-lg hover:bg-primary-c50 transition-colors`}
          title="Scroll left"
        >
          <svg className="w-4 h-4 text-primary-c900" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Scroll container */}
      <div
        ref={scrollerRef}
        role="tablist"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onScroll={updateScrollState}
        className="flex-1 overflow-x-auto no-scrollbar relative"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="flex gap-4 items-center py-1">
          {items.map((item) => {
            const isActive = item.key === activeKey;
            return (
              <div key={item.key} className="flex items-center" data-tab-wrapper>
                {renderItem ? renderItem(item, isActive) : defaultRender(item, isActive)}
              </div>
            );
          })}
        </div>

        {/* Animated underline indicator */}
        <div
          aria-hidden
          className={`pointer-events-none absolute bottom-1 h-1 bg-primary-c700 transition-all duration-300 ease-in-out rounded`}
          style={{
            left: indicator.visible ? `${indicator.left}px` : "0px",
            width: indicator.visible ? `${indicator.width}px` : "0px",
            opacity: indicator.visible ? 1 : 0,
            transitionProperty: "left, width, opacity",
          }}
        />
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          type="button"
          aria-hidden={!canScrollRight}
          onClick={() => scrollBy(scrollStep)}
          tabIndex={0}
          className={`p-2 rounded-lg hover:bg-primary-c50 transition-colors`}
          title="Scroll right"
        >
          <svg className="w-4 h-4 text-primary-c900" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
