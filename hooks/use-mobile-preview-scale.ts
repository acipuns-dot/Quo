"use client";

import { useEffect, useState } from "react";

const A4_PX_WIDTH = 794;

export function useMobilePreviewScale(horizontalPadding = 32): number | null {
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    function calculate() {
      if (window.innerWidth >= 768) {
        setScale(null);
        return;
      }
      setScale((window.innerWidth - horizontalPadding) / A4_PX_WIDTH);
    }
    calculate();
    window.addEventListener("resize", calculate);
    return () => window.removeEventListener("resize", calculate);
  }, [horizontalPadding]);

  return scale;
}
