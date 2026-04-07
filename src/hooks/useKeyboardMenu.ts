import { useEffect } from "react";

type Params = {
  itemCount: number;
  selectedIndex: number;
  onChange: (next: number) => void;
  onEnter: () => void;
  onBack?: () => void;
};

export function useKeyboardMenu({
  itemCount,
  selectedIndex,
  onChange,
  onEnter,
  onBack,
}: Params) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowUp") {
        event.preventDefault();
        onChange((selectedIndex - 1 + itemCount) % itemCount);
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        onChange((selectedIndex + 1) % itemCount);
      }

      if (event.key === "Enter") {
        event.preventDefault();
        onEnter();
      }

      if (event.key === "Escape" && onBack) {
        event.preventDefault();
        onBack();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [itemCount, selectedIndex, onChange, onEnter, onBack]);
}