import { useCallback, useEffect } from "react";
import apiClient from "@/api/apiClient";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearCart } from "@/store/slices/cartSlice";
import type { CartItem } from "@/types";

interface RazorpayOrderResponse {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface CheckoutCallbacks {
  /** The Razorpay modal is about to open. */
  onOpen?: () => void;
  /** The user closed the Razorpay modal without completing payment. */
  onDismiss?: () => void;
  /** Payment succeeded; we're verifying it server-side. */
  onVerifying?: () => void;
  /** Payment verified and the cart cleared. */
  onSuccess?: (orderId: string) => void;
  /** Anything went wrong (order creation, gateway, or verification). */
  onError?: (message: string) => void;
}

export type CheckoutPayload =
  | { mode: "delivery"; addressId: string }
  | {
      mode: "in_store";
      customerName: string;
      customerPhone: string;
      customerEmail?: string;
      items: CartItem[];
    };

const RAZORPAY_SCRIPT_ID = "razorpay-script";

function ensureRazorpayScript() {
  if (document.getElementById(RAZORPAY_SCRIPT_ID)) return;
  const script = document.createElement("script");
  script.id = RAZORPAY_SCRIPT_ID;
  script.src = "https://checkout.razorpay.com/v1/checkout.js";
  script.async = true;
  document.body.appendChild(script);
}

/**
 * The single source of truth for the order → pay → verify flow, shared by the
 * Cart page and the in-chat concierge. It creates the order (POST /orders),
 * opens the standard Razorpay checkout, verifies the payment, and clears the
 * cart on success. Razorpay's hosted checkout is the ONLY place payment details
 * are ever entered — we never touch card/UPI data ourselves.
 */
export function useCheckout() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  // Load the gateway script once, up front, so it's ready when the user pays.
  useEffect(() => {
    ensureRazorpayScript();
  }, []);

  const placeOrder = useCallback(
    async (payload: CheckoutPayload, cb: CheckoutCallbacks = {}) => {
      try {
        const { data } = payload.mode === "delivery"
          ? await apiClient.post<RazorpayOrderResponse>("/orders", { addressId: payload.addressId })
          : await apiClient.post<RazorpayOrderResponse>("/orders/in-store", {
              customerName: payload.customerName,
              customerPhone: payload.customerPhone,
              customerEmail: payload.customerEmail || null,
              items: payload.items.map((item) => ({
                productId: item.productId,
                sizeMl: item.size,
                quantity: item.quantity,
              })),
            });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const Razorpay = (window as any).Razorpay;
        if (!Razorpay) {
          cb.onError?.("Payment gateway unavailable. Please try again.");
          return;
        }

        const rzp = new Razorpay({
          key: data.keyId,
          amount: data.amount,
          currency: data.currency,
          order_id: data.razorpayOrderId,
          name: "BLANC PARFUM",
          description: "Luxury Extrait de Parfum",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: async (response: any) => {
            cb.onVerifying?.();
            try {
              const verifyUrl = payload.mode === "delivery"
                ? `/orders/${data.orderId}/verify`
                : `/orders/in-store/${data.orderId}/verify`;
              await apiClient.post(verifyUrl, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              dispatch(clearCart());
              cb.onSuccess?.(data.orderId);
            } catch {
              cb.onError?.("Payment verification failed. Contact support.");
            }
          },
          modal: { ondismiss: () => cb.onDismiss?.() },
          prefill: {
            name: payload.mode === "in_store" ? payload.customerName : user?.name ?? "",
            email: payload.mode === "in_store" ? payload.customerEmail ?? "" : user?.email ?? "",
            contact: payload.mode === "in_store" ? payload.customerPhone : user?.phone ?? "",
          },
          config: {
            display: {
              blocks: { upi_block: { name: "Pay using UPI", instruments: [{ method: "upi", flows: ["collect", "qrcode"] }] } },
              sequence: ["block.upi_block"],
              preferences: { show_default_blocks: true },
            },
          },
          theme: { color: "#B8860B" },
        });
        cb.onOpen?.();
        rzp.open();
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          "Checkout failed. Please try again.";
        cb.onError?.(msg);
      }
    },
    [dispatch, user],
  );

  return { placeOrder };
}
