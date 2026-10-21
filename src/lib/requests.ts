import { supabase } from "./supabase";

export type RequestStatus = "new" | "contacted" | "done";

export interface ServiceRequest {
  id: string;
  name: string;
  whatsapp: string;
  email: string | null;
  service: string;
  city: string | null;
  budget: string | null;
  preferred_date: string | null;
  message: string | null;
  status: RequestStatus;
  created_at: string;
}

export interface ServiceRequestInput {
  name: string;
  whatsapp: string;
  service: string;
  message: string;
}

const blankToNull = (v: string) => (v.trim() === "" ? null : v.trim());

export async function submitServiceRequest(f: ServiceRequestInput) {
  const { error } = await supabase.from("service_requests").insert({
    name: f.name.trim(),
    whatsapp: f.whatsapp.trim(),
    service: f.service,
    message: blankToNull(f.message),
  });
  if (error) throw error;
}

export async function fetchServiceRequests(): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from("service_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return (data ?? []) as ServiceRequest[];
}

export async function setRequestStatus(id: string, status: RequestStatus) {
  const { error } = await supabase.from("service_requests").update({ status }).eq("id", id);
  if (error) throw error;
}

export async function deleteServiceRequest(id: string) {
  const { error } = await supabase.from("service_requests").delete().eq("id", id);
  if (error) throw error;
}
