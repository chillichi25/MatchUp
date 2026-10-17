import { describe, expect, it } from "@jest/globals";

import { getNotificationHref } from "./notification-href";

describe("getNotificationHref", () => {
  it("routes friendly requests to the requests inbox", () => {
    expect(getNotificationHref("friendly_request", "req-1")).toBe(
      "/friendlies/requests/req-1"
    );
    expect(getNotificationHref("friendly_request", null)).toBe(
      "/friendlies/requests"
    );
  });

  it("routes accepted friendlies to the match", () => {
    expect(getNotificationHref("friendly_accepted", "m-1")).toBe("/matches/m-1");
  });

  it("routes chat notifications to the conversation", () => {
    expect(getNotificationHref("message", "c-1")).toBe("/chat/c-1");
    expect(getNotificationHref("conversation", null)).toBe("/chat");
  });

  it("routes tournament notifications", () => {
    expect(getNotificationHref("tournament", "t-1")).toBe("/tournaments/t-1");
    expect(getNotificationHref("tournament_update", "u-1")).toBe(
      "/tournaments/updates/u-1"
    );
    expect(getNotificationHref("tournament_request", null)).toBe(
      "/tournaments/requests"
    );
  });

  it("returns null for unknown types", () => {
    expect(getNotificationHref("something_else", "x")).toBeNull();
  });
});
