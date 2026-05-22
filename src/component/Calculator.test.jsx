import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import Calculator from "../Calculator";
import * as AuthContext from "../../context/AuthContext";
import * as ShopContext from "../../context/ShopContext";
import * as shopData from "../../services/shopData";

// Mock dependencies
vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../../context/ShopContext", () => ({
  useShop: vi.fn(),
}));

vi.mock("../../services/shopData", () => ({
  saveBillAndConsumeStockForShop: vi.fn(),
  updateBillAndConsumeStockDeltaForShop: vi.fn(),
  subscribeToShopBills: vi.fn(),
  subscribeToShopCustomers: vi.fn(),
  subscribeToShopInventoryItems: vi.fn(),
  upsertCustomerForShop: vi.fn(),
}));

describe("Calculator Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock active user
    AuthContext.useAuth.mockReturnValue({
      user: { uid: "test-user-123" },
    });

    // Mock active shop context
    ShopContext.useShop.mockReturnValue({
      activeShopId: "shop-123",
      shop: { name: "Test Shop", thermalPrinterWidth: "80mm" },
    });

    // Mock empty subscriptions
    shopData.subscribeToShopBills.mockImplementation((shopId, uid, cb) => {
      cb([]);
      return vi.fn();
    });

    shopData.subscribeToShopCustomers.mockImplementation((shopId, cb) => {
      cb([]);
      return vi.fn();
    });

    shopData.subscribeToShopInventoryItems.mockImplementation((shopId, cb) => {
      cb([]);
      return vi.fn();
    });
  });

  it("renders the Smart Billing Desk header", () => {
    render(<Calculator />);
    expect(screen.getByText("Smart Billing Desk")).toBeInTheDocument();
  });

  it("adds an item to the bill correctly", async () => {
    render(<Calculator />);

    const itemNameInput = screen.getByLabelText(/Item Name or Code/i);
    const itemPriceInput = screen.getByLabelText(/Item Price/i);
    const quantityInput = screen.getByLabelText(/^Quantity$/i);

    fireEvent.change(itemNameInput, { target: { value: "Test Item" } });
    fireEvent.change(itemPriceInput, { target: { value: "100" } });
    fireEvent.change(quantityInput, { target: { value: "2" } });

    const addButton = screen.getByRole("button", { name: /Add Item/i });
    fireEvent.click(addButton);

    // Expect the added item to be in the list
    expect(
      await screen.findByText(/Test Item - 100 piece x 2 piece/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Total: Rs\. 200\.00/i)).toBeInTheDocument();
  });

  it("displays error toast when adding an item with 0 quantity", async () => {
    render(<Calculator />);

    fireEvent.change(screen.getByLabelText(/Item Name or Code/i), {
      target: { value: "Test Item" },
    });
    fireEvent.change(screen.getByLabelText(/Item Price/i), {
      target: { value: "100" },
    });
    fireEvent.change(screen.getByLabelText(/^Quantity$/i), {
      target: { value: "0" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Add Item/i }));
    expect(
      await screen.findByText(/Price and quantity must be greater than zero/i),
    ).toBeInTheDocument();
  });
});
