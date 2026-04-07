import { useEffect } from "react";

export function useWindowKeydown(handler: (event: KeyboardEvent) => void): void {
  useEffect(() => {
    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [handler]);
}