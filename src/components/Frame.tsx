import type { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  title: string;
}>;

export function Frame({ title, children }: Props) {
  return (
    <div className="frame">
      <pre className="header-box">{title}</pre>
      <div className="frame-content">{children}</div>
    </div>
  );
}
