import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Viewer } from "@/features/learner-workspace/learner-workspace.types";

import { WaitlistForm } from "./waitlist-form";

const viewer: Viewer = { id: "learner-1", displayName: "Pranita", avatarUrl: null };
const joinedEntry = {
  status: "joined" as const,
  sourceLessonSlug: null,
  consentVersion: "founding-pro-v1",
  consentedAt: "2026-09-11T10:00:00.000Z",
  unsubscribedAt: null,
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("WaitlistForm", () => {
  it("sends anonymous learners through sign-in and back to the waitlist", () => {
    render(<WaitlistForm viewer={null} initialEntry={null} />);
    expect(screen.getByRole("link", { name: /sign in to join/i })).toHaveAttribute(
      "href",
      "/sign-in?returnTo=%2Fcontact",
    );
  });

  it("requires explicit consent before joining", async () => {
    const user = userEvent.setup();
    render(<WaitlistForm viewer={viewer} initialEntry={null} sourceLessonSlug="dns-and-name-resolution" />);

    const join = screen.getByRole("button", { name: /join founding pro waitlist/i });
    expect(join).toBeDisabled();
    expect(screen.getAllByText(/no payment/i)).not.toHaveLength(0);
    await user.click(screen.getByRole("checkbox", { name: /email me product and launch updates/i }));
    expect(join).toBeEnabled();
  });

  it("shows joined state only after the server confirms the request", async () => {
    const user = userEvent.setup();
    let resolveRequest!: (response: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { resolveRequest = resolve; }));
    vi.stubGlobal("fetch", fetchMock);
    render(<WaitlistForm viewer={viewer} initialEntry={null} sourceLessonSlug="dns-and-name-resolution" />);

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /join founding pro waitlist/i }));
    expect(screen.getByRole("button", { name: /joining/i })).toBeDisabled();
    expect(screen.queryByText(/you are on the list/i)).not.toBeInTheDocument();

    resolveRequest(Response.json({ entry: joinedEntry }));
    expect(await screen.findByText(/you are on the list/i)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/pro-waitlist", expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ consent: true, sourceLessonSlug: "dns-and-name-resolution" }),
    }));
  });

  it("lets joined learners turn updates off and rejoin", async () => {
    const user = userEvent.setup();
    const unsubscribed = { ...joinedEntry, status: "unsubscribed" as const, unsubscribedAt: "2026-09-11T11:00:00.000Z" };
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ entry: unsubscribed }));
    vi.stubGlobal("fetch", fetchMock);
    render(<WaitlistForm viewer={viewer} initialEntry={joinedEntry} />);

    await user.click(screen.getByRole("button", { name: /turn off updates/i }));
    expect(await screen.findByText(/updates are off/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).not.toBeChecked();
    expect(fetchMock).toHaveBeenCalledWith("/api/pro-waitlist", expect.objectContaining({ method: "DELETE" }));
  });

  it("keeps the current state and offers a retry after a failure", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 503 })));
    render(<WaitlistForm viewer={viewer} initialEntry={null} initialUnavailable />);

    expect(screen.getByRole("status")).toHaveTextContent(/temporarily unavailable/i);
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: /join founding pro waitlist/i }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/try again/i));
    expect(screen.queryByText(/you are on the list/i)).not.toBeInTheDocument();
  });
});
