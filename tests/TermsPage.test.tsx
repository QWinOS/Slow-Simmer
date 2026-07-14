import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import TermsPage from "@/app/terms/page"

vi.mock("@/components/NavBar", () => ({
  default: () => <div data-testid="navbar">NavBar</div>,
}))

vi.mock("@/components/Footer", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}))

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

describe("TermsPage", () => {
  it("renders NavBar and Footer", () => {
    render(<TermsPage />)
    expect(screen.getByTestId("navbar")).toBeInTheDocument()
    expect(screen.getByTestId("footer")).toBeInTheDocument()
  })

  it("renders the page heading", () => {
    render(<TermsPage />)
    expect(
      screen.getByRole("heading", { name: /terms & conditions/i })
    ).toBeInTheDocument()
  })

  it("renders the last updated date", () => {
    render(<TermsPage />)
    expect(screen.getByText(/last updated/i)).toBeInTheDocument()
    expect(screen.getByText(/july 14, 2026/i)).toBeInTheDocument()
  })

  it("renders all 8 T&C clauses with headings", () => {
    render(<TermsPage />)

    expect(
      screen.getByRole("heading", { name: /1\. introduction/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /2\. membership.*eligibility/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /3\. event participation/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /4\. code of conduct/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /5\. payment.*refunds/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /6\. liability disclaimer/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /7\. privacy/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("heading", { name: /8\. contact.*modifications/i })
    ).toBeInTheDocument()
  })

  it("renders the Back to Registration link", () => {
    render(<TermsPage />)
    const link = screen.getByRole("link", { name: /back to registration/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("href", "/#form")
  })

  it("renders clause body text (not just headings)", () => {
    render(<TermsPage />)
    expect(
      screen.getByText(/by registering for an event/i)
    ).toBeInTheDocument()
  })
})
