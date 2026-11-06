import { getMeApi } from "../api/user";
export function useUser() {
  return { getMe: getMeApi };
}
