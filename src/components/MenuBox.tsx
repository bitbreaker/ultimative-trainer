type Props = {
  items: string[];
  selected: number;
};

export function MenuBox({ items, selected }: Props) {
  return (
    <div className="menu-box">
      {items.map((item, index) => {
        const prefix = String.fromCharCode(65 + index);

        return (
          <div
            key={item}
            className={`menu-option ${index === selected ? "active" : ""}`}
          >
            {prefix}) {item}
          </div>
        );
      })}
    </div>
  );
}