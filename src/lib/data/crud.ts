import { createClient } from "@/lib/supabase/server";

export async function requireUserId(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function nextSortOrder(
  table: string,
  userId: string,
  scopeColumn: string,
  scopeValue: string
): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from(table)
    .select("sort_order")
    .eq("user_id", userId)
    .eq(scopeColumn, scopeValue)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return ((data as { sort_order: number } | null)?.sort_order ?? -1) + 1;
}

// These helpers operate on table names decided entirely by hardcoded
// call-sites (never client input), so the loose `any` casts below just
// bypass Supabase's generated-types machinery, which we don't have wired
// up yet — they are not a data-validation boundary.

export async function insertOwnedRow(
  table: string,
  userId: string,
  data: Record<string, unknown>
) {
  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from(table)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert({ ...data, user_id: userId } as any)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function updateOwnedRow(
  table: string,
  userId: string,
  id: string,
  data: Record<string, unknown>
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from(table)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(data as any)
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteOwnedRow(table: string, userId: string, id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

/**
 * Swaps sort_order with the previous/next sibling row sharing `scopeColumn`.
 * `scopeColumn` is "user_id" for top-level entities, or the parent id column
 * (e.g. "experience_id") for nested bullets.
 */
export async function moveOwnedRow(
  table: string,
  userId: string,
  scopeColumn: string,
  scopeValue: string,
  id: string,
  direction: "up" | "down"
) {
  const supabase = await createClient();
  const { data: siblings, error } = await supabase
    .from(table)
    .select("id, sort_order")
    .eq("user_id", userId)
    .eq(scopeColumn, scopeValue)
    .order("sort_order");
  if (error) throw error;
  if (!siblings) return;

  const rows = siblings as { id: string; sort_order: number }[];
  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) return;
  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= rows.length) return;

  const current = rows[index];
  const neighbor = rows[neighborIndex];

  await Promise.all([
    supabase
      .from(table)
      .update({ sort_order: neighbor.sort_order })
      .eq("id", current.id)
      .eq("user_id", userId),
    supabase
      .from(table)
      .update({ sort_order: current.sort_order })
      .eq("id", neighbor.id)
      .eq("user_id", userId),
  ]);
}
