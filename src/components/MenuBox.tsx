export type MenuItemSpec = {
  label: string;
  description?: string;
  badge?: string;
};

type Props = {
  items: MenuItemSpec[];
  selected: number;
  onSelect?: (index: number) => void;
  onActivate?: (index: number) => void;
};

export function MenuBox({ items, selected, onSelect, onActivate }: Props) {
  return (
    <div className="menu-box">
      {items.map((item, index) => {
        const prefix = String.fromCharCode(65 + index);
        const isActive = index === selected;

        return (
          <button
            key={`${item.label}-${index}`}
            type="button"
            className={`menu-option ${isActive ? "active" : ""}`}
            onClick={() => onActivate?.(index)}
            onFocus={() => onSelect?.(index)}
            onPointerEnter={() => onSelect?.(index)}
          >
            <div className="menu-option-topline">
              <span className="menu-option-prefix">{prefix})</span>
              <span className="menu-option-label">{item.label}</span>
              {item.badge ? <span className="menu-badge">{item.badge}</span> : null}
            </div>

            {item.description ? (
              <div className="menu-option-description">{item.description}</div>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}