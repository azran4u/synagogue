import { useMemo } from "react";
import { prayerCardMapper, PrayerCard, PrayerCardDto } from "../model/Prayer";
import { GenericService } from "../services/genericService";
import { useAppSelector } from "../store/hooks";
import { selectSelectedSynagogueId } from "../store/synagogueSlice";
import {
  prayerEventTypeMapper,
  PrayerEventType,
  PrayerEventTypeDto,
} from "../model/PrayerEventType";
import { aliyaTypeMapper, AliyaType, AliyaTypeDto } from "../model/AliyaType";
import {
  aliyaGroupMapper,
  AliyaGroup,
  AliyaGroupDto,
} from "../model/AliyaGroup";
import { adminMapper, Admin, AdminDto } from "../model/Admin";
import {
  prayerTimesMapper,
  PrayerTimes,
  PrayerTimesDto,
} from "../model/PrayerTimes";
import {
  toraLessonsMapper,
  ToraLesson,
  ToraLessonDto,
} from "../model/ToraLessons";

interface SynagogueServices {
  prayerCardService: GenericService<PrayerCard, PrayerCardDto> | null;
  prayerEventTypeService: GenericService<
    PrayerEventType,
    PrayerEventTypeDto
  > | null;
  aliyaTypeService: GenericService<AliyaType, AliyaTypeDto> | null;
  aliyaGroupService: GenericService<AliyaGroup, AliyaGroupDto> | null;
  gabaimService: GenericService<Admin, AdminDto> | null;
  prayerTimesService: GenericService<PrayerTimes, PrayerTimesDto> | null;
  toraLessonsService: GenericService<ToraLesson, ToraLessonDto> | null;
}

export function useSynagogueServices(): SynagogueServices {
  const synagogueId = useAppSelector(selectSelectedSynagogueId);
  return useMemo(() => {
    if (!synagogueId) {
      return {
        prayerCardService: null,
        prayerEventTypeService: null,
        aliyaTypeService: null,
        aliyaGroupService: null,
        gabaimService: null,
        prayerTimesService: null,
        toraLessonsService: null,
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
      prayerTimesService: new GenericService(
        "prayerTimes",
        prayerTimesMapper,
        synagogueId
      ),
      toraLessonsService: new GenericService(
        "toraLessons",
        toraLessonsMapper,
        synagogueId
      ),
    };
  }, [synagogueId]);
}
