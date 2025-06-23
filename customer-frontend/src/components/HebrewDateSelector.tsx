import React, { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import {
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { HebrewDate } from "../model/HebrewDate";
import { DatesUtil } from "../utils/DatesUtil";

interface HebrewDateSelectorProps {
  value: HebrewDate | null;
  onChange: (date: HebrewDate | null) => void;
  label?: string;
}

export const HebrewDateSelector: React.FC<HebrewDateSelectorProps> = ({
  value,
  onChange,
  label,
}) => {
  const [dateType, setDateType] = useState<"georgian" | "hebrew">("georgian");
  const [georgianDate, setGeorgianDate] = useState<Date | null>(
    value ? value.toGregorianDate() : null
  );
  const [hebrewDate, setHebrewDate] = useState<HebrewDate>(
    value || HebrewDate.now()
  );

  useEffect(() => {
    if (value) {
      setHebrewDate(value);
      setGeorgianDate(value.toGregorianDate());
    }
  }, [value]);

  const handleDateTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateType(event.target.value as "georgian" | "hebrew");
  };

  const handleGeorgianDateChange = (date: Date | null) => {
    setGeorgianDate(date);
    if (date) {
      const newHebrewDate = HebrewDate.fromGregorianDate(date);
      setHebrewDate(newHebrewDate);
      onChange(newHebrewDate);
    } else {
      onChange(null);
    }
  };

  const handleHebrewDateChange = (
    type: "day" | "month" | "year",
    event: SelectChangeEvent<number>
  ) => {
    const newValue = event.target.value as number;
    let newHebrewDate: HebrewDate;

    switch (type) {
      case "day":
        newHebrewDate = new HebrewDate(
          hebrewDate.year,
          hebrewDate.month,
          newValue
        );
        break;
      case "month":
        newHebrewDate = new HebrewDate(
          hebrewDate.year,
          newValue,
          hebrewDate.day
        );
        break;
      case "year":
        newHebrewDate = new HebrewDate(
          newValue,
          hebrewDate.month,
          hebrewDate.day
        );
        break;
      default:
        return;
    }

    setHebrewDate(newHebrewDate);
    setGeorgianDate(newHebrewDate.toGregorianDate());
    onChange(newHebrewDate);
  };

  return (
    <Stack spacing={2}>
      <RadioGroup row value={dateType} onChange={handleDateTypeChange}>
        <FormControlLabel
          value="georgian"
          control={<Radio />}
          label="תאריך לועזי"
        />
        <FormControlLabel
          value="hebrew"
          control={<Radio />}
          label="תאריך עברי"
        />
      </RadioGroup>

      {dateType === "georgian" ? (
        <Stack spacing={1}>
          <DatePicker
            value={georgianDate}
            onChange={handleGeorgianDateChange}
            label={label}
          />
          {georgianDate && (
            <Typography
              variant="body2"
              align="center"
              sx={{ direction: "rtl" }}
            >
              {DatesUtil.hebrewDateToString(hebrewDate)}
            </Typography>
          )}
        </Stack>
      ) : (
        <Stack spacing={1}>
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 80 }}>
              <Typography variant="caption">יום</Typography>
              <Select
                value={hebrewDate.day}
                onChange={e => handleHebrewDateChange("day", e)}
                size="small"
              >
                {Object.entries(DatesUtil.HEBREW_DAYS).map(
                  ([day, hebrewDay]) => (
                    <MenuItem key={day} value={Number(day)}>
                      {hebrewDay}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <Typography variant="caption">חודש</Typography>
              <Select
                value={hebrewDate.month}
                onChange={e => handleHebrewDateChange("month", e)}
                size="small"
              >
                {Object.entries(DatesUtil.HEBREW_MONTHS).map(
                  ([month, hebrewMonth]) => (
                    <MenuItem key={month} value={Number(month)}>
                      {hebrewMonth}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 100 }}>
              <Typography variant="caption">שנה</Typography>
              <Select
                value={hebrewDate.year}
                onChange={e => handleHebrewDateChange("year", e)}
                size="small"
              >
                {Object.entries(DatesUtil.HEBREW_YEARS).map(
                  ([year, hebrewYear]) => (
                    <MenuItem key={year} value={Number(year)}>
                      {hebrewYear}
                    </MenuItem>
                  )
                )}
              </Select>
            </FormControl>
          </Stack>
          {georgianDate && (
            <Typography variant="body2" align="center">
              {DatesUtil.dateToString(georgianDate)}
            </Typography>
          )}
        </Stack>
      )}
    </Stack>
  );
};
