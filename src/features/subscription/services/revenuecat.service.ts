import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type PurchasesError,
  type PurchasesOffering,
  type PurchasesPackage,
} from "react-native-purchases";

import { env } from "@/lib/config";

import { PAID_PLANS } from "../constants";
import { PurchaseError, type PlanId } from "../types";

let configured = false;

function apiKey(): string {
  if (Platform.OS === "ios") {
    return env.revenueCatIosApiKey.trim();
  }

  if (Platform.OS === "android") {
    return env.revenueCatAndroidApiKey.trim();
  }

  return "";
}

export function isBillingConfigured(): boolean {
  return apiKey().length > 0;
}

export function configureBilling(): boolean {
  if (configured) {
    return true;
  }

  const key = apiKey();

  if (!key) {
    return false;
  }

  try {
    if (__DEV__) {
      void Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey: key });
    configured = true;
    return true;
  } catch (error) {
    console.error("REVENUECAT CONFIGURE ERROR:", error);
    return false;
  }
}

function ensureBilling(): void {
  if (!isBillingConfigured() || !configureBilling()) {
    throw new PurchaseError(
      "unavailable",
      "Subscriptions aren't available on this device right now."
    );
  }
}

export async function identifyBillingUser(userId: string): Promise<void> {
  if (!isBillingConfigured()) {
    return;
  }

  if (!configureBilling()) {
    return;
  }

  try {
    await Purchases.logIn(userId);
  } catch (error) {
    console.error("REVENUECAT LOGIN ERROR:", error);
  }
}

export async function clearBillingUser(): Promise<void> {
  if (!configured) {
    return;
  }

  try {
    await Purchases.logOut();
  } catch (error) {
    console.error("REVENUECAT LOGOUT ERROR:", error);
  }
}

export async function fetchCustomerInfo(): Promise<CustomerInfo> {
  ensureBilling();
  return Purchases.getCustomerInfo();
}

export async function fetchOffering(): Promise<PurchasesOffering | null> {
  ensureBilling();
  const offerings = await Purchases.getOfferings();
  return offerings.current ?? null;
}

export function findPackageForPlan(
  offering: PurchasesOffering | null,
  planId: PlanId
): PurchasesPackage | null {
  if (!offering) {
    return null;
  }

  const plan = PAID_PLANS.find((candidate) => candidate.id === planId);

  if (!plan) {
    return null;
  }

  return (
    offering.availablePackages.find((pkg) =>
      plan.productIds.includes(pkg.product.identifier)
    ) ?? null
  );
}

export function planFromPackage(pkg: PurchasesPackage): PlanId {
  const plan = PAID_PLANS.find((candidate) =>
    candidate.productIds.includes(pkg.product.identifier)
  );

  return plan?.id ?? "free";
}

function toPurchaseError(error: unknown): PurchaseError {
  const purchasesError = error as Partial<PurchasesError> | undefined;
  const code = purchasesError?.code;

  if (purchasesError?.userCancelled) {
    return new PurchaseError("cancelled", "Purchase cancelled.");
  }

  switch (code) {
    case PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR:
      return new PurchaseError("cancelled", "Purchase cancelled.");
    case PURCHASES_ERROR_CODE.PAYMENT_PENDING_ERROR:
      return new PurchaseError(
        "pending",
        "Your purchase is pending approval. We'll update your plan once it's confirmed."
      );
    case PURCHASES_ERROR_CODE.PRODUCT_ALREADY_PURCHASED_ERROR:
      return new PurchaseError(
        "already-owned",
        "You already own this subscription. Try restoring purchases."
      );
    case PURCHASES_ERROR_CODE.NETWORK_ERROR:
      return new PurchaseError(
        "network",
        "We couldn't reach the store. Check your connection and try again."
      );
    case PURCHASES_ERROR_CODE.PURCHASE_NOT_ALLOWED_ERROR:
    case PURCHASES_ERROR_CODE.STORE_PROBLEM_ERROR:
      return new PurchaseError(
        "unavailable",
        "The store isn't available right now. Please try again later."
      );
    default:
      return new PurchaseError(
        "unknown",
        purchasesError?.message || "The purchase couldn't be completed."
      );
  }
}

export async function purchasePlan(planId: PlanId): Promise<CustomerInfo> {
  const offering = await fetchOffering();
  const pkg = findPackageForPlan(offering, planId);

  if (!pkg) {
    throw new PurchaseError(
      "unavailable",
      "This plan isn't available in the store yet."
    );
  }

  try {
    const result = await Purchases.purchasePackage(pkg);
    return result.customerInfo;
  } catch (error) {
    throw toPurchaseError(error);
  }
}

export async function restoreBillingPurchases(): Promise<CustomerInfo> {
  ensureBilling();

  try {
    return await Purchases.restorePurchases();
  } catch (error) {
    throw toPurchaseError(error);
  }
}

export async function openBillingManagement(): Promise<void> {
  ensureBilling();
  await Purchases.showManageSubscriptions();
}

export function onCustomerInfoChanged(
  listener: (customerInfo: CustomerInfo) => void
): () => void {
  Purchases.addCustomerInfoUpdateListener(listener);

  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}
