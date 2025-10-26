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
  aliyaTypeCategoryMapper,
  AliyaTypeCategory,
  AliyaTypeCategoryDto,
} from "../model/AliyaTypeCategory";
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
import {
  financialReportsMapper,
  FinancialReport,
  FinancialReportDto,
} from "../model/FinancialReports";
import { donationMapper, Donation, DonationDto } from "../model/Donation";

interface SynagogueServices {
  prayerCardService: GenericService<PrayerCard, PrayerCardDto> | null;
  prayerEventTypeService: GenericService<
    PrayerEventType,
    PrayerEventTypeDto
  > | null;
  aliyaTypeService: GenericService<AliyaType, AliyaTypeDto> | null;
  aliyaTypeCategoryService: GenericService<
    AliyaTypeCategory,
    AliyaTypeCategoryDto
  > | null;
  aliyaGroupService: GenericService<AliyaGroup, AliyaGroupDto> | null;
  gabaimService: GenericService<Admin, AdminDto> | null;
  prayerTimesService: GenericService<PrayerTimes, PrayerTimesDto> | null;
  toraLessonsService: GenericService<ToraLesson, ToraLessonDto> | null;
  financialReportsService: GenericService<
    FinancialReport,
    FinancialReportDto
  > | null;
  donationsService: GenericService<Donation, DonationDto> | null;
}

export function useSynagogueServices(): SynagogueServices {
  const synagogueId = useAppSelector(selectSelectedSynagogueId);
  return useMemo(() => {
    if (!synagogueId) {
      return {
        prayerCardService: null,
        prayerEventTypeService: null,
        aliyaTypeService: null,
        aliyaTypeCategoryService: null,
        aliyaGroupService: null,
        gabaimService: null,
        prayerTimesService: null,
        toraLessonsService: null,
        financialReportsService: null,
        donationsService: null,
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
      aliyaTypeCategoryService: new GenericService(
        "aliyaTypeCategories",
        aliyaTypeCategoryMapper,
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
      financialReportsService: new GenericService(
        "financialReports",
        financialReportsMapper,
        synagogueId
      ),
      donationsService: new GenericService(
        "donations",
        donationMapper,
        synagogueId
      ),
    };
  }, [synagogueId]);
}
