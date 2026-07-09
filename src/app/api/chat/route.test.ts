import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import { NextRequest } from "next/server";

// Mock the GoogleGenerativeAI SDK to avoid hitting actual endpoints during tests
vi.mock("@google/generative-ai", () => {
  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContentStream: async () => ({
            stream: [
              { text: () => "Mocked " },
              { text: () => "Gemini " },
              { text: () => "response." }
            ]
          })
        };
      }
    }
  };
});

describe("/api/chat route tests", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.GEMINI_API_KEY;
  });

  it("handles offline mock stream when GEMINI_API_KEY is missing", async () => {
    const mockReq = {
      json: async () => ({
        messages: [{ role: "user", content: "Tell me about Gate 1 locations." }]
      })
    } as unknown as NextRequest;

    const response = await POST(mockReq);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/plain");

    // Read the stream contents
    const reader = response.body?.getReader();
    expect(reader).toBeDefined();

    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { value, done } = await reader!.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }

    expect(text).toContain("Gate 1");
    expect(text).toContain("open");
  });

  it("calls live Gemini model when GEMINI_API_KEY is present", async () => {
    process.env.GEMINI_API_KEY = "MOCK_KEY_VALID";

    const mockReq = {
      json: async () => ({
        messages: [{ role: "user", content: "Hello AI" }]
      })
    } as unknown as NextRequest;

    const response = await POST(mockReq);
    expect(response.status).toBe(200);

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let text = "";
    while (true) {
      const { value, done } = await reader!.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }

    expect(text).toBe("Mocked Gemini response.");
  });
});
