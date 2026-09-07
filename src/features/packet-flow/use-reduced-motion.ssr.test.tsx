import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { layerModelsLab } from "../layer-models/layer-models.data";
import { EncapsulationPlayer } from "../layer-models/encapsulation-player";

describe("reduced-motion hydration safety", () => {
  it("hydrates a reduced-motion preference without autoplay or an active timer", async () => {
    const reactGlobals = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const previousActEnvironment = reactGlobals.IS_REACT_ACT_ENVIRONMENT;
    reactGlobals.IS_REACT_ACT_ENVIRONMENT = true;
    const browserWindow = window;
    const originalMatchMedia = browserWindow.matchMedia;
    const mediaQueryList = {
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    } as unknown as MediaQueryList;
    browserWindow.matchMedia = vi.fn(() => mediaQueryList);
    vi.useFakeTimers();

    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      vi.stubGlobal("window", undefined);
      const markup = renderToString(<EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);
      expect(markup).toContain('data-reduced-motion="true"');
      expect(markup).toContain(">Play</button>");
      expect(markup).not.toContain(">Pause</button>");

      vi.stubGlobal("window", browserWindow);
      const container = document.createElement("div");
      container.innerHTML = markup;
      document.body.appendChild(container);

      await act(async () => {
        root = hydrateRoot(container, <EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);
        await Promise.resolve();
      });

      expect(container.querySelector('[data-reduced-motion="true"]')).toBeInTheDocument();
      expect(container.querySelector('button:not([disabled]):nth-of-type(2)')).toHaveTextContent("Play");
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      await act(async () => {
        root?.unmount();
      });
      browserWindow.matchMedia = originalMatchMedia;
      vi.unstubAllGlobals();
      vi.useRealTimers();
      reactGlobals.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    }
  });

  it("resolves normal motion after hydration, then starts exactly one autoplay timer", async () => {
    const reactGlobals = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };
    const previousActEnvironment = reactGlobals.IS_REACT_ACT_ENVIRONMENT;
    reactGlobals.IS_REACT_ACT_ENVIRONMENT = true;
    const browserWindow = window;
    const originalMatchMedia = browserWindow.matchMedia;
    const mediaQueryList = {
      matches: false,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(() => true),
    } as unknown as MediaQueryList;
    browserWindow.matchMedia = vi.fn(() => mediaQueryList);
    vi.useFakeTimers();

    let root: ReturnType<typeof hydrateRoot> | undefined;
    const recoverableErrors: unknown[] = [];
    try {
      vi.stubGlobal("window", undefined);
      const markup = renderToString(<EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />);
      expect(markup).toContain('data-reduced-motion="true"');
      expect(markup).toContain(">Play</button>");
      expect(markup).not.toContain(">Pause</button>");

      vi.stubGlobal("window", browserWindow);
      const container = document.createElement("div");
      container.innerHTML = markup;
      document.body.appendChild(container);

      await act(async () => {
        root = hydrateRoot(container, <EncapsulationPlayer steps={layerModelsLab.encapsulationSteps} />, {
          onRecoverableError: (error) => recoverableErrors.push(error),
        });
        await Promise.resolve();
      });

      expect(recoverableErrors).toEqual([]);
      expect(container.querySelector('[data-reduced-motion="false"]')).toBeInTheDocument();
      expect(container.querySelector('button:not([disabled]):nth-of-type(2)')).toHaveTextContent("Pause");
      expect(vi.getTimerCount()).toBe(1);

      await act(async () => {
        root?.unmount();
      });
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      if (root) {
        await act(async () => {
          root?.unmount();
        });
      }
      browserWindow.matchMedia = originalMatchMedia;
      vi.unstubAllGlobals();
      vi.useRealTimers();
      reactGlobals.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
    }
  });
});
