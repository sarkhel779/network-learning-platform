import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ saveLearnerEdit: vi.fn() }));
vi.mock("@/app/admin/users/[id]/actions", () => ({ saveLearnerEdit: mocks.saveLearnerEdit }));

import { LearnerEditor } from "./learner-editor";

describe("LearnerEditor", () => {
  it("submits only profile fields and shows an audited success result", async () => {
    mocks.saveLearnerEdit.mockResolvedValue({ ok: true, message: "Account changes saved and audited." });
    render(<LearnerEditor learner={{ id: "00000000-0000-4000-8000-000000000102", email: "ada@example.test", displayName: "Ada", learningLevel: "beginner", createdAt: "2026-09-12T00:00:00Z", waitlistStatus: null, notes: [] }} />);
    expect(screen.getByLabelText("Display name")).toHaveValue("Ada");
    expect(screen.queryByRole("button", { name: /refund|impersonate|delete/i })).not.toBeInTheDocument();
    fireEvent.submit(screen.getByRole("button", { name: "Save changes" }).closest("form")!);
    expect(await screen.findByRole("status")).toHaveTextContent("saved and audited");
    expect(mocks.saveLearnerEdit).toHaveBeenCalledOnce();
  });
});
