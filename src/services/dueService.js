import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  runTransaction,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../Firebase/firebase";
import { getShopBillsCollection, getShopBillDocRef } from "./shopData";

/**
 * Records a payment against a specific bill in Firestore.
 * 
 * @param {string} shopId 
 * @param {string} billId 
 * @param {object} payment - { amount: number, paymentMode: string, remarks: string, date: string }
 */
export const recordBillPayment = async (shopId, billId, payment) => {
  const billRef = getShopBillDocRef(shopId, billId);

  await runTransaction(db, async (transaction) => {
    const docSnap = await transaction.get(billRef);
    if (!docSnap.exists()) {
      throw new Error("Bill not found");
    }

    const billData = docSnap.data();
    const currentDue = Number(billData.dueAmount ?? billData.totalAmount ?? 0);
    const payAmount = Number(payment.amount);

    if (payAmount <= 0) {
      throw new Error("Payment amount must be positive");
    }

    const newDue = Math.max(0, currentDue - payAmount);
    const paymentRecord = {
      id: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      amount: payAmount,
      paymentMode: payment.paymentMode || "Cash",
      remarks: payment.remarks || "",
      date: payment.date || new Date().toISOString(),
    };

    const previousPayments = Array.isArray(billData.payments) ? billData.payments : [];

    transaction.update(billRef, {
      dueAmount: Number(newDue.toFixed(2)),
      payments: [...previousPayments, paymentRecord],
      updatedAt: new Date().toISOString(),
    });
  });
};

/**
 * Records a general customer payment and automatically distributes it to their oldest outstanding bills.
 * 
 * @param {string} shopId 
 * @param {string} userId 
 * @param {string} customerPhone 
 * @param {number} totalPaymentAmount 
 * @param {string} paymentMode 
 * @param {string} remarks 
 */
export const recordCustomerGeneralPayment = async (
  shopId,
  userId,
  customerPhone,
  totalPaymentAmount,
  paymentMode = "Cash",
  remarks = ""
) => {
  if (!customerPhone) {
    throw new Error("Customer phone number is required");
  }

  const payAmount = Number(totalPaymentAmount);
  if (payAmount <= 0) {
    throw new Error("Payment amount must be positive");
  }

  const billsQuery = query(
    getShopBillsCollection(shopId),
    where("userId", "==", userId),
    where("phoneNumber", "==", customerPhone)
  );

  await runTransaction(db, async (transaction) => {
    const snapshot = await getDocs(billsQuery);
    
    // Filter and sort bills by oldest first
    const outstandingBills = snapshot.docs
      .map((d) => ({ id: d.id, ref: d.ref, ...d.data() }))
      .filter((b) => {
        // Outstanding is either explicit dueAmount or totalAmount if dueAmount is missing
        const due = b.dueAmount !== undefined ? Number(b.dueAmount) : Number(b.totalAmount || 0);
        return due > 0;
      })
      .sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return aTime - bTime; // Oldest first
      });

    if (!outstandingBills.length) {
      throw new Error("No outstanding dues found for this customer");
    }

    let remaining = payAmount;
    const dateStr = new Date().toISOString();

    for (const bill of outstandingBills) {
      if (remaining <= 0) break;

      const currentDue = bill.dueAmount !== undefined ? Number(bill.dueAmount) : Number(bill.totalAmount || 0);
      const allocation = Math.min(remaining, currentDue);
      const newDue = Math.max(0, currentDue - allocation);

      const paymentRecord = {
        id: `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        amount: Number(allocation.toFixed(2)),
        paymentMode,
        remarks: remarks ? `${remarks} (Auto-allocated)` : "Auto-allocated settlement",
        date: dateStr,
      };

      const previousPayments = Array.isArray(bill.payments) ? bill.payments : [];

      transaction.update(bill.ref, {
        dueAmount: Number(newDue.toFixed(2)),
        payments: [...previousPayments, paymentRecord],
        updatedAt: dateStr,
      });

      remaining -= allocation;
    }
  });
};
