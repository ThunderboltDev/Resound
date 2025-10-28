"use client";

import {
  type ComponentType,
  type CSSProperties,
  type FC,
  useCallback,
  useMemo,
  useRef,
} from "react";
import ReactCanvasConfetti from "react-canvas-confetti";
import type { TCanvasConfettiAnimationOptions } from "react-canvas-confetti/dist/types";

export interface WithConfettiProps {
  triggerConfetti: () => void;
}

const CANVAS_STYLE: CSSProperties = {
  position: "fixed",
  pointerEvents: "none",
  zIndex: 9999,
  width: "100%",
  height: "100vh",
  overflow: "hidden",
  top: 0,
  left: 0,
};

function withConfetti<T extends object>(
  WrappedComponent: ComponentType<T & WithConfettiProps>
) {
  const ConfettiComponent: FC<T> = (props) => {
    const confettiRef = useRef<
      ((opts: TCanvasConfettiAnimationOptions) => void) | null
    >(null);

    const defaultOptions = useMemo<TCanvasConfettiAnimationOptions>(
      () => ({
        particleCount: 200,
        shapes: ["square"],
        spread: 50,
        gravity: 1.4,
        decay: 0.95,
        ticks: 10_000,
        origin: { x: 0.5, y: 1 },
      }),
      []
    );

    const triggerConfetti = useCallback(() => {
      if (!confettiRef.current) return;
      confettiRef.current(defaultOptions);
    }, [defaultOptions]);

    const renderConfetti = () => (
      <ReactCanvasConfetti
        onInit={({
          confetti,
        }: {
          confetti: (opts: TCanvasConfettiAnimationOptions) => void;
        }) => {
          confettiRef.current = confetti;
        }}
        style={CANVAS_STYLE}
      />
    );

    return (
      <>
        {typeof window !== "undefined" && renderConfetti()}
        <WrappedComponent {...(props as T)} triggerConfetti={triggerConfetti} />
      </>
    );
  };

  ConfettiComponent.displayName = `withConfetti(${
    WrappedComponent.displayName ?? WrappedComponent.name ?? "Component"
  })`;

  return ConfettiComponent;
}

export default withConfetti;
