import { createClient } from "@/lib/supabase/server";

export async function cancelFriendly(
  friendlyId: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be logged in to cancel a friendly."
    );
  }

  const cleanFriendlyId = friendlyId.trim();

  if (!cleanFriendlyId) {
    throw new Error("A friendly is required.");
  }

  const { error } = await supabase.rpc(
    "cancel_friendly",
    {
      p_friendly_id: cleanFriendlyId,
    }
  );

  if (error) {
    console.error(
      "CANCEL FRIENDLY ERROR:",
      error
    );

    throw new Error(
      "We couldn't cancel this friendly."
    );
  }

  return { success: true };
}