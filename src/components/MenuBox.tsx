type Props = {
  items: string[];
  selected: number;
  onSelect?: (index: number) => void;
  onActivate?: (index: number) => void;
};

export function MenuBox({ items, selected, onSelect, onActivate }: Props) {
  return (
    <div className="menu-box" role="menu" aria-orientation="vertical">
      {items.map((item, index) => {
        const prefix = String.fromCharCode(65 + index);
        const isActive = index === selected;

        return (
          <button
            key={`${prefix}-${item}`}
            type="button"
            className={`menu-option ${isActive ? "active" : ""}`}
            onClick={() => onActivate?.(index)}
            onFocus={() => onSelect?.(index)}
            onPointerEnter={() => onSelect?.(index)}
          >
            <span className="menu-option-prefix">{prefix})</span>
            <span className="menu-option-label">{item}</span>
          </button>
        );
      })}
    </div>
  );
}
