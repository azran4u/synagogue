import { useMemo } from "react";
import { familyMapper } from "../model/Family";
import { invitationMapper } from "../model/Invitation";
import { prayerCardMapper } from "../model/Prayer";
import { GenericService } from "../services/genericService";
import { useAppSelector } from "../store/hooks";
import { selectSelectedSynagogueId } from "../store/synagogueSlice";
import { prayerEventTypeMapper } from "../model/PrayerEventType";
import { aliyaTypeMapper } from "../model/AliyaType";
import { aliyaGroupMapper } from "../model/AliyaGroup";

export function useSynagogueServices() {
  const synagogueId = useAppSelector(selectSelectedSynagogueId);
  return useMemo(() => {
    if (!synagogueId) {
      return {
        invitationService: null,
        familyService: null,
        prayerCardService: null,
        prayerEventTypeService: null,
        aliyaTypeService: null,
        aliyaGroupService: null,
        membershipService: null,
      };
    }
    return {
      invitationService: new GenericService(
        "invitations",
        invitationMapper,
        synagogueId
      ),
      familyService: new GenericService("families", familyMapper, synagogueId),
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
    };
  }, [synagogueId]);
}
