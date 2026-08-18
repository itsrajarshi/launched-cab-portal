"use client";

import { useEffect } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "./hooks";

let client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  if (!client) {
    client = createClient(url, anonKey);
  }
  return client;
}

/**
 * Subscribes to Supabase Realtime changes on the `bookings` table and
 * invalidates the React Query bookings cache so the UI stays live without
 * polling. Safe to mount once per page; channel is cleaned up on unmount.
 */
export function useBookingsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel("bookings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.bookings });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}