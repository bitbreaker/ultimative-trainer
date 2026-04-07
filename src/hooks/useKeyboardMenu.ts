import { useWindowKeydown } from "./useWindowKeydown";

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
  useWindowKeydown((event) => {
    if (itemCount <= 0) {
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      onChange((selectedIndex - 1 + itemCount) % itemCount);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      onChange((selectedIndex + 1) % itemCount);
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      onEnter();
      return;
    }

    if (event.key === "Escape" && onBack) {
      event.preventDefault();
      onBack();
    }
  });
}