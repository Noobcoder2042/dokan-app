import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BillsTable from "../BillsTable";

describe("BillsTable Component", () => {
  const mockBills = [
    {
      id: "bill-1",
      name: "John Doe",
      phoneNumber: "1234567890",
      date: "10/05/2026",
      totalAmount: 1500,
    },
    {
      id: "bill-2",
      name: "Jane Smith",
      phoneNumber: "0987654321",
      date: "11/05/2026",
      totalAmount: 2500.5,
    },
  ];

  it('renders "No bills found" when the bills array is empty', () => {
    render(<BillsTable bills={[]} />);
    expect(screen.getByText("No bills found")).toBeInTheDocument();
  });

  it("renders table rows correctly for each bill", () => {
    render(<BillsTable bills={mockBills} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    // Totals format with 2 decimal places
    expect(screen.getByText("Rs. 1500.00")).toBeInTheDocument();
    expect(screen.getByText("Rs. 2500.50")).toBeInTheDocument();
  });

  it("calls onPreview when the Preview button is clicked", () => {
    const onPreviewMock = vi.fn();
    render(<BillsTable bills={mockBills} onPreview={onPreviewMock} />);

    const previewButtons = screen.getAllByRole("button", { name: /preview/i });
    fireEvent.click(previewButtons[0]);
    expect(onPreviewMock).toHaveBeenCalledWith(mockBills[0]);
  });

  it("calls onDelete when the Delete icon is clicked", () => {
    const onDeleteMock = vi.fn();
    render(<BillsTable bills={mockBills} onDelete={onDeleteMock} />);

    const deleteButtons = screen.getAllByLabelText("delete bill");
    fireEvent.click(deleteButtons[1]);
    expect(onDeleteMock).toHaveBeenCalledWith(mockBills[1]);
  });
});
