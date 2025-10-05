import { useMemo } from "react";
import { prayerCardMapper } from "../model/Prayer";
import { GenericService } from "../services/genericService";
import { useAppSelector } from "../store/hooks";
import { selectSelectedSynagogueId } from "../store/synagogueSlice";
import { prayerEventTypeMapper } from "../model/PrayerEventType";
import { aliyaTypeMapper } from "../model/AliyaType";
import { aliyaGroupMapper } from "../model/AliyaGroup";
import { adminMapper } from "../model/Admin";

export function useSynagogueServices() {
  const synagogueId = useAppSelector(selectSelectedSynagogueId);
  return useMemo(() => {
    if (!synagogueId) {
      return {
        prayerCardService: null,
        prayerEventTypeService: null,
        aliyaTypeService: null,
        aliyaGroupService: null,
        gabaimService: null,
      };
    }
    return {
      prayerCardService: new GenericService(
        "prayerCards",
        prayerCardMapper,
        synagogueId
      ),
      prayerEventTypeService: new GenericService(
        "prayerEventTypes",
        prayerEventTypeMapper,
        synagogueId
      ),
      aliyaTypeService: new GenericService(
        "aliyaTypes",
        aliyaTypeMapper,
        synagogueId
      ),
      aliyaGroupService: new GenericService(
        "aliyaGroups",
        aliyaGroupMapper,
        synagogueId
      ),
      gabaimService: new GenericService("gabaim", adminMapper, synagogueId),
    };
  }, [synagogueId]);
}
