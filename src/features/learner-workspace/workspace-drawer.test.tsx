import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { WorkspaceDrawer } from "./workspace-drawer";

afterEach(cleanup);

describe("WorkspaceDrawer", () => {
  it("renders nothing while closed", () => {
    render(
      <WorkspaceDrawer
        open={false}
        title="Notes"
        triggerRef={createRef<HTMLButtonElement>()}
        onClose={vi.fn()}
      >
        <button>First action</button>
      </WorkspaceDrawer>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("focuses the first control, traps focus, and closes with Escape", async () => {
    const user = userEvent.setup();
    const triggerRef = createRef<HTMLButtonElement>();
    const close = vi.fn();
    const { rerender } = render(
      <>
        <button ref={triggerRef}>Notes</button>
        <WorkspaceDrawer open title="Notes" triggerRef={triggerRef} onClose={close}>
          <button>First action</button>
          <a href="/last">Last action</a>
        </WorkspaceDrawer>
      </>,
    );

    expect(screen.getByRole("dialog", { name: "Notes" })).toBeVisible();
    expect(screen.getByRole("button", { name: "Close Notes" })).toHaveFocus();

    screen.getByRole("link", { name: "Last action" }).focus();
    await user.keyboard("{Tab}");
    expect(screen.getByRole("button", { name: "Close Notes" })).toHaveFocus();

    await user.keyboard("{Escape}");
    expect(close).toHaveBeenCalledOnce();

    rerender(
      <>
        <button ref={triggerRef}>Notes</button>
        <WorkspaceDrawer open={false} title="Notes" triggerRef={triggerRef} onClose={close}>
          <button>First action</button>
        </WorkspaceDrawer>
      </>,
    );
    expect(triggerRef.current).toHaveFocus();
  });

  it("closes from the labelled backdrop", async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    render(
      <WorkspaceDrawer
        open
        title="Bookmarks"
        triggerRef={createRef<HTMLButtonElement>()}
        onClose={close}
      >
        <button>First action</button>
      </WorkspaceDrawer>,
    );

    await user.click(screen.getByRole("button", { name: "Dismiss Bookmarks" }));
    expect(close).toHaveBeenCalledOnce();
  });
});
