import { useEffect, useRef } from "react";

export function useWindowKeydown(handler: (event: KeyboardEvent) => void): void {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    function listener(event: KeyboardEvent) {
      handlerRef.current(event);
    }

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);
}
