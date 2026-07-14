/**
 * Unit tests for components/PaymentSection.tsx
 *
 * Per VALIDATION.md Per-Task Verification Map (PAY-03):
 * Tests verify PaymentSection renders correct UI for idle/awaiting/success/failure states.
 *
 * Strategy: Mock RegistrationProvider to control context data.
 * Mock global fetch and window.Razorpay for payment flow simulation.
 * No real HTTP calls or external scripts loaded.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { ReactNode } from "react"

// Polyfill ResizeObserver for jsdom (used by UI components)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

// Polyfill scrollIntoView for jsdom
Element.prototype.scrollIntoView = vi.fn()

// Mock use-in-view for Reveal component
vi.mock("@/hooks/use-in-view", () => ({
  useInView: () => ({ ref: { current: null }, inView: true }),
}))

// Mock RegistrationProvider so we can control context data
const mockUseRegistration = vi.fn()
vi.mock("@/components/RegistrationProvider", () => ({
  useRegistration: mockUseRegistration,
  RegistrationProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

// Now import the component under test after mocks are applied
const { PaymentSection } = await import("@/components/PaymentSection")

const mockRegistrationData = {
  location: "The Grand Hall",
  eventDate: "2026-07-20",
  eventTime: "7:00 PM",
  name: "Test Guest",
  contact: "9876543210",
  email: "guest@test.com",
  aadhar: "123456789012",
  guests: [],
  about: "Love good food!",
  social: "https://instagram.com/test",
  price: 50000,
}

function renderSection() {
  return render(<PaymentSection />)
}

describe("PaymentSection", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID = "rzp_test_key"
  })

  afterEach(() => {
    // Clean up any window.Razorpay that was set during tests
    delete (window as any).Razorpay
    // Clean up global fetch to prevent cross-test leakage
    delete (global as any).fetch
  })

  /* ── 1. Placeholder state (no registration data) ── */
  describe("1. Placeholder state", () => {
    it("renders placeholder when no registration data", () => {
      mockUseRegistration.mockReturnValue({ data: null })
      renderSection()

      expect(screen.getByText("Complete Your Payment")).toBeInTheDocument()
      expect(screen.getByText(/Fill the registration form above/i)).toBeInTheDocument()
    })

    it("does not render Pay button when no registration data", () => {
      mockUseRegistration.mockReturnValue({ data: null })
      renderSection()

      expect(screen.queryByRole("button", { name: /pay/i })).not.toBeInTheDocument()
    })
  })

  /* ── 2. Summary card state (idle) ── */
  describe("2. Summary card state", () => {
    it("renders summary card when registration data exists", () => {
      mockUseRegistration.mockReturnValue({ data: mockRegistrationData, clearRegistrationData: vi.fn() })
      renderSection()

      expect(screen.getByText("The Grand Hall")).toBeInTheDocument()
      expect(screen.getByText("2026-07-20")).toBeInTheDocument()
      expect(screen.getByText("7:00 PM")).toBeInTheDocument()
      expect(screen.getByText("Test Guest")).toBeInTheDocument()
    })

    it("renders Pay button with correct amount", () => {
      mockUseRegistration.mockReturnValue({ data: mockRegistrationData, clearRegistrationData: vi.fn() })
      renderSection()

      const payButton = screen.getByRole("button", { name: /pay/i })
      expect(payButton).toBeInTheDocument()
      expect(payButton).not.toBeDisabled()
      // 50000 paise = ₹500
      expect(payButton).toHaveTextContent(/500/)
    })
  })

  /* ── 3. Success state ── */
  describe("3. Success state", () => {
    beforeEach(() => {
      // Mock fetch: first call creates order, second call verifies
      ;(global as any).fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ orderId: "order_123" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ verified: true, paymentId: "pay_123" }),
        })
    })

    /**
     * Helper: setup the Razorpay mock that simulates a successful payment.
     * Uses a plain function (not vi.fn()) to avoid constructor issues with `new`.
     */
    function setupSuccessfulRazorpay() {
      ;(window as any).Razorpay = function (this: any, options: any) {
        setTimeout(() => {
          options.handler({
            razorpay_payment_id: "pay_123",
            razorpay_order_id: "order_123",
            razorpay_signature: "sig_123",
          })
        }, 0)
        this.on = () => {}
        this.open = () => {}
      }
    }

    it("transitions to success state after successful payment", async () => {
      const user = userEvent.setup()
      setupSuccessfulRazorpay()
      mockUseRegistration.mockReturnValue({ data: mockRegistrationData, clearRegistrationData: vi.fn() })
      renderSection()

      await user.click(screen.getByRole("button", { name: /pay/i }))

      // Wait for success state to render
      const successHeading = await screen.findByText("Registration confirmed!")
      expect(successHeading).toBeInTheDocument()
      expect(screen.getByText("Check your email for details.")).toBeInTheDocument()
    })

    it("shows success card content and description", async () => {
      const user = userEvent.setup()
      setupSuccessfulRazorpay()
      mockUseRegistration.mockReturnValue({ data: mockRegistrationData, clearRegistrationData: vi.fn() })
      renderSection()

      await user.click(screen.getByRole("button", { name: /pay/i }))

      // Verify success text and description rendered
      expect(await screen.findByText("Registration confirmed!")).toBeInTheDocument()
      expect(screen.getByText("Check your email for details.")).toBeInTheDocument()
    })
  })

  /* ── 4. Failure state ── */
  describe("4. Failure state", () => {
    /**
     * Helper: setup the Razorpay mock that simulates a failed verification.
     */
    function setupFailedVerificationRazorpay() {
      ;(window as any).Razorpay = function (this: any, options: any) {
        setTimeout(() => {
          options.handler({
            razorpay_payment_id: "pay_123",
            razorpay_order_id: "order_123",
            razorpay_signature: "bad_sig",
          })
        }, 0)
        this.on = () => {}
        this.open = () => {}
      }
    }

    it("transitions to failure state when payment verification fails", async () => {
      const user = userEvent.setup()

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ orderId: "order_123" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: "Invalid signature" }),
        })

      setupFailedVerificationRazorpay()
      mockUseRegistration.mockReturnValue({ data: mockRegistrationData, clearRegistrationData: vi.fn() })
      renderSection()

      await user.click(screen.getByRole("button", { name: /pay/i }))

      const failureHeading = await screen.findByText("Payment failed")
      expect(failureHeading).toBeInTheDocument()
      expect(screen.getByText("Back to Form")).toBeInTheDocument()
    })

    it("renders 'Back to Form' button that can be clicked in failure state", async () => {
      const user = userEvent.setup()

      global.fetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ orderId: "order_123" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: () => Promise.resolve({ error: "Invalid signature" }),
        })

      setupFailedVerificationRazorpay()
      mockUseRegistration.mockReturnValue({ data: mockRegistrationData, clearRegistrationData: vi.fn() })
      renderSection()

      await user.click(screen.getByRole("button", { name: /pay/i }))

      const backButton = await screen.findByText("Back to Form")
      expect(backButton).toBeInTheDocument()
      // Click should not throw
      await user.click(backButton)
    })
  })
})
