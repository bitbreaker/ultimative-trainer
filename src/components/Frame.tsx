type Props = {
  title: string;
  children: React.ReactNode;
};

export function Frame({ title, children }: Props) {
  return (
    <div className="frame">
      <pre className="header-box">{title}</pre>
      <div className="frame-content">{children}</div>
    </div>
  );
}