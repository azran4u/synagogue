import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/reportSrevice";

export function useReport() {
  return useQuery({
    queryKey: ["report"],
    queryFn: () => reportService.getReport(),
  });
}
