import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RegistrationForm } from "@/components/RegistrationForm"
import { RegistrationProvider } from "@/components/RegistrationProvider"

// Polyfill ResizeObserver for jsdom (used by Radix UI components)
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver

// Polyfill scrollIntoView for jsdom (used in onSubmit handler + Radix Select)
Element.prototype.scrollIntoView = vi.fn()

// Polyfill Pointer Capture APIs for jsdom (used by Radix Select trigger)
if (!HTMLElement.prototype.hasPointerCapture) {
  HTMLElement.prototype.hasPointerCapture = vi.fn(() => false)
  HTMLElement.prototype.releasePointerCapture = vi.fn()
  HTMLElement.prototype.setPointerCapture = vi.fn()
}

// Mock IntersectionObserver for Reveal component (not available in jsdom)
vi.mock("@/hooks/use-in-view", () => ({
  useInView: () => ({ ref: { current: null }, inView: true }),
}))

// Mock sonner toast to avoid portal rendering issues
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockLocations = [
  { location: "Kolkata", date: "Dec 15, 2024", time: "7:00 PM", price: 50000, maxMember: 4 },
  { location: "Delhi", date: "Jan 20, 2025", time: "6:30 PM", price: 75000, maxMember: 1 },
]

beforeEach(() => {
  global.fetch = vi.fn((url: string) => {
    if (url === "/api/locations") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockLocations),
      } as Response)
    }
    return Promise.reject(new Error(`unexpected fetch: ${url}`))
  })
})

function renderForm() {
  return render(
    <RegistrationProvider>
      <RegistrationForm />
    </RegistrationProvider>
  )
}

// Fill the required location dropdown with the first available city.
async function selectLocation(user: ReturnType<typeof userEvent.setup>, name = "Kolkata") {
  await user.click(screen.getByLabelText(/choose event location/i))
  await user.click(await screen.findByRole("option", { name: new RegExp(name, "i") }))
}

// Fill every required field for a valid submit (about + social are required).
async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await selectLocation(user)
  await user.type(screen.getByLabelText(/full name/i), "Test User")
  await user.type(screen.getByLabelText(/contact number/i), "9876543210")
  await user.type(screen.getByLabelText(/email address/i), "test@example.com")
  await user.type(screen.getByLabelText(/aadhar number/i), "123456789012")
  await user.type(screen.getByLabelText(/about yourself/i), "Love good food and people")
  await user.type(screen.getByLabelText(/instagram or linkedin/i), "https://instagram.com/test")
}

describe("RegistrationForm Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /* ── 1. Form renders all sections ── */
  describe("1. Form renders all sections", () => {
    it("renders the heading and section titles", () => {
      renderForm()

      expect(screen.getByText("Reserve Your Spot")).toBeInTheDocument()
      expect(screen.getByText("Personal Information")).toBeInTheDocument()
      expect(screen.getByText("Guest Details")).toBeInTheDocument()
      expect(screen.getByText("Social & About")).toBeInTheDocument()
    })

    it("renders all field labels as accessible inputs", () => {
      renderForm()

      expect(screen.getByLabelText(/choose event location/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contact number/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/aadhar number/i)).toBeInTheDocument()
      expect(screen.getByText("Additional guests")).toBeInTheDocument()
      expect(screen.getByLabelText(/about yourself/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/instagram or linkedin/i)).toBeInTheDocument()
    })

    it("renders the submit button", () => {
      renderForm()

      expect(
        screen.getByRole("button", { name: /submit registration/i })
      ).toBeInTheDocument()
    })
  })

  /* ── 1b. Choose Event Location dropdown ── */
  describe("1b. Choose Event Location dropdown", () => {
    it("renders locations from API with date and time", async () => {
      const user = userEvent.setup()
      renderForm()

      await user.click(screen.getByLabelText(/choose event location/i))

      const kolkata = await screen.findByRole("option", { name: /kolkata/i })
      const delhi = await screen.findByRole("option", { name: /delhi/i })

      expect(kolkata).toBeInTheDocument()
      expect(kolkata).toHaveTextContent(/dec 15, 2024/i)
      expect(kolkata).toHaveTextContent(/7:00 pm/i)
      expect(delhi).toBeInTheDocument()
      expect(delhi).toHaveTextContent(/jan 20, 2025/i)
      expect(delhi).toHaveTextContent(/6:30 pm/i)
    })

    it("lets the user select a location", async () => {
      const user = userEvent.setup()
      renderForm()

      await selectLocation(user)

      expect(screen.getByLabelText(/choose event location/i)).toHaveTextContent("Kolkata")
    })

    it("blocks submission when no location is selected", async () => {
      const user = userEvent.setup()
      renderForm()

      await user.type(screen.getByLabelText(/full name/i), "Test User")
      await user.type(screen.getByLabelText(/contact number/i), "9876543210")
      await user.type(screen.getByLabelText(/email address/i), "test@example.com")
      await user.type(screen.getByLabelText(/aadhar number/i), "123456789012")

      await user.click(
        screen.getByRole("button", { name: /submit registration/i })
      )

      await waitFor(() => {
        const errors = screen.getAllByText("Please select a location")
        expect(errors.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  /* ── 2. Required fields show asterisk ── */
  describe("2. Required fields show asterisk", () => {
    it("displays asterisk on required field labels", () => {
      renderForm()

      // Required: Full Name, Contact Number, Email Address, Aadhar Number
      const nameLabel = screen.getByText(/full name/i).closest("label")
      const contactLabel = screen.getByText(/contact number/i).closest("label")
      const emailLabel = screen.getByText(/email address/i).closest("label")
      const aadharLabel = screen.getByText(/aadhar number/i).closest("label")

      expect(nameLabel?.textContent).toContain("*")
      expect(contactLabel?.textContent).toContain("*")
      expect(emailLabel?.textContent).toContain("*")
      expect(aadharLabel?.textContent).toContain("*")
    })

    it("displays asterisk on required About and Social labels", () => {
      renderForm()

      // About + Social are required in the shipped schema (min length / URL).
      const aboutLabel = screen.getByText("About Yourself").closest("label")
      const socialLabel = screen.getByText("Instagram or LinkedIn").closest("label")

      expect(aboutLabel?.textContent).toContain("*")
      expect(socialLabel?.textContent).toContain("*")
    })
  })

  /* ── 3. onBlur validation shows inline errors ── */
  describe("3. onBlur validation shows inline errors", () => {
    it("shows name validation error on blur", async () => {
      const user = userEvent.setup()
      renderForm()

      const nameInput = screen.getByLabelText(/full name/i)
      await user.type(nameInput, "A")
      // Click next field to trigger blur on name
      await user.click(screen.getByLabelText(/contact number/i))

      // Error appears in both ErrorSummary (<li>) and FieldError (<div>) —
      // use getAllByText to confirm at least one instance
      await waitFor(() => {
        const errors = screen.getAllByText("Name must be at least 2 characters")
        expect(errors.length).toBeGreaterThanOrEqual(1)
      })
    })

    it("shows contact validation error on blur", async () => {
      const user = userEvent.setup()
      renderForm()

      const contactInput = screen.getByLabelText(/contact number/i)
      await user.type(contactInput, "12345")
      // Click next field to trigger blur on contact
      await user.click(screen.getByLabelText(/email address/i))

      await waitFor(() => {
        const errors = screen.getAllByText(
          "Enter a valid 10-digit Indian mobile number"
        )
        expect(errors.length).toBeGreaterThanOrEqual(1)
      })
    })

    it("shows email validation error on blur", async () => {
      const user = userEvent.setup()
      renderForm()

      const emailInput = screen.getByLabelText(/email address/i)
      await user.type(emailInput, "notanemail")
      // Click next field to trigger blur on email
      await user.click(screen.getByLabelText(/aadhar number/i))

      await waitFor(() => {
        const errors = screen.getAllByText("Enter a valid email address")
        expect(errors.length).toBeGreaterThanOrEqual(1)
      })
    })

    it("renders FieldError component for invalid fields", async () => {
      const user = userEvent.setup()
      renderForm()

      const nameInput = screen.getByLabelText(/full name/i)
      await user.type(nameInput, "A")
      await user.click(screen.getByLabelText(/contact number/i))

      // The error text may appear in both ErrorSummary and FieldError —
      // use getAllByText to confirm at least one instance
      await waitFor(() => {
        const errors = screen.getAllByText("Name must be at least 2 characters")
        expect(errors.length).toBeGreaterThanOrEqual(1)
      })
    })
  })

  /* ── 4. Guest counter adds/removes guest rows ── */
  describe("4. Guest counter adds/removes guest rows", () => {
    it("renders no guest rows initially", () => {
      renderForm()

      expect(screen.queryByLabelText(/guest 1 name/i)).not.toBeInTheDocument()
      expect(screen.getByLabelText("Guest count")).toHaveTextContent("0")
    })

    it("disables add until a location is selected", () => {
      renderForm()
      expect(screen.getByRole("button", { name: /add guest/i })).toBeDisabled()
    })

    it("adds and removes guest rows via the counter", async () => {
      const user = userEvent.setup()
      renderForm()

      await selectLocation(user) // Kolkata, maxMember 4 → up to 3 guests
      const add = screen.getByRole("button", { name: /add guest/i })

      await user.click(add)
      expect(screen.getByLabelText(/guest 1 name/i)).toBeInTheDocument()
      expect(screen.getByLabelText("Guest count")).toHaveTextContent("1")

      await user.click(add)
      expect(screen.getByLabelText(/guest 2 name/i)).toBeInTheDocument()

      await user.click(screen.getByRole("button", { name: /remove guest/i }))
      expect(screen.queryByLabelText(/guest 2 name/i)).not.toBeInTheDocument()
    })

    it("caps the counter at maxMember - 1 guests", async () => {
      const user = userEvent.setup()
      renderForm()

      await selectLocation(user) // maxMember 4 → max 3 guests
      const add = screen.getByRole("button", { name: /add guest/i })

      await user.click(add)
      await user.click(add)
      await user.click(add)
      expect(screen.getByLabelText("Guest count")).toHaveTextContent("3")
      expect(add).toBeDisabled() // can't exceed capacity
    })
  })

  /* ── 5. Error summary banner appears on submit with errors ── */
  describe("5. Error summary banner appears on submit with errors", () => {
    it("shows error summary when submitting empty form", async () => {
      const user = userEvent.setup()
      renderForm()

      await user.click(
        screen.getByRole("button", { name: /submit registration/i })
      )

      // Multiple role="alert" elements exist (ErrorSummary + FieldErrors),
      // so find the one that is the summary banner by its content
      await waitFor(() => {
        const alerts = screen.getAllByRole("alert")
        const summaryAlert = alerts.find((a) =>
          a.textContent?.includes("Please fix the following errors:")
        )
        expect(summaryAlert).toBeDefined()
        expect(summaryAlert).toHaveTextContent("Name must be at least 2 characters")
      })
    })
  })

  /* ── 6. Submit succeeds with valid data ── */
  describe("6. Submit succeeds with valid data", () => {
    it("does not show error summary after submitting valid data", async () => {
      const user = userEvent.setup()
      renderForm()

      await fillRequired(user)

      await user.click(
        screen.getByRole("button", { name: /submit registration/i })
      )

      // No error summary should be present after valid submit
      await waitFor(() => {
        expect(
          screen.queryByText(/please fix the following errors/i)
        ).not.toBeInTheDocument()
      })
    })
  })

  /* ── 7. Aadhar input masks and formats ── */
  describe("7. Aadhar input masks and formats", () => {
    it("has type password (masked)", () => {
      renderForm()
      const aadharInput = screen.getByLabelText(/aadhar number/i)
      expect(aadharInput).toHaveAttribute("type", "password")
    })

    it("formats typed digits with spaces", async () => {
      const user = userEvent.setup()
      renderForm()

      const aadharInput = screen.getByLabelText(/aadhar number/i)
      await user.type(aadharInput, "123456789012")

      // The formatAadhar function inserts spaces: XXXX XXXX XXXX
      // The value is controlled by React Hook Form via Controller
      await waitFor(() => {
        expect(aadharInput).toHaveValue("1234 5678 9012")
      })
    })
  })

  /* ── 8. Added guest rows are required ── */
  describe("8. Added guest rows are required", () => {
    it("shows guest errors when a guest row is added but left empty", async () => {
      const user = userEvent.setup()
      renderForm()

      await selectLocation(user)
      await user.type(screen.getByLabelText(/full name/i), "Test User")
      await user.type(screen.getByLabelText(/contact number/i), "9876543210")
      await user.type(screen.getByLabelText(/email address/i), "test@example.com")
      await user.type(screen.getByLabelText(/aadhar number/i), "123456789012")

      // Add a guest row, leave it empty
      await user.click(screen.getByRole("button", { name: /add guest/i }))
      await user.click(
        screen.getByRole("button", { name: /submit registration/i })
      )

      await waitFor(() => {
        expect(screen.getAllByText("Guest name is required").length).toBeGreaterThanOrEqual(1)
        expect(screen.getAllByText("Guest age is required").length).toBeGreaterThanOrEqual(1)
      })
    })

    it("does not require guest fields when no guest rows added", async () => {
      const user = userEvent.setup()
      renderForm()

      await fillRequired(user)

      await user.click(
        screen.getByRole("button", { name: /submit registration/i })
      )

      await waitFor(() => {
        expect(
          screen.queryByText(/please fix the following errors/i)
        ).not.toBeInTheDocument()
      })
      expect(screen.queryAllByText("Guest name is required").length).toBe(0)
    })

    it("submits cleanly when guest rows are filled", async () => {
      const user = userEvent.setup()
      renderForm()

      await fillRequired(user)

      await user.click(screen.getByRole("button", { name: /add guest/i }))
      await user.type(screen.getByLabelText(/guest 1 name/i), "Jane Doe")
      await user.type(screen.getByLabelText(/guest 1 age/i), "28")

      await user.click(
        screen.getByRole("button", { name: /submit registration/i })
      )

      await waitFor(() => {
        expect(
          screen.queryByText(/please fix the following errors/i)
        ).not.toBeInTheDocument()
      })
      expect(screen.queryAllByText("Guest name is required").length).toBe(0)
    })
  })
})
