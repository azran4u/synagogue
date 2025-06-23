import React from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Prayer } from "../model/Prayer";
import { AliyaEventsList } from "./AliyaEventsList";

interface ChildrenListProps {
  children: Prayer[];
}

export const ChildrenList: React.FC<ChildrenListProps> = ({ children }) => {
  if (!children || children.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontStyle: "italic" }}
      >
        אין ילדים רשומים
      </Typography>
    );
  }

  return (
    <List dense>
      {children.map((child, index) => (
        <ListItem
          key={index}
          sx={{ px: 0, flexDirection: "column", alignItems: "stretch" }}
        >
          <Box sx={{ width: "100%" }}>
            <ListItemText
              primary={`${child.firstName} ${child.lastName}`}
              secondary={
                child.hebrewBirthDate && (
                  <Typography variant="caption">
                    תאריך לידה: {child.hebrewBirthDate.toString()}
                  </Typography>
                )
              }
            />

            {child.aliyaHistory && child.aliyaHistory.length > 0 && (
              <Accordion
                sx={{ mt: 1, boxShadow: "none", border: "1px solid #e0e0e0" }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    minHeight: "40px",
                    "& .MuiAccordionSummary-content": { margin: "8px 0" },
                  }}
                >
                  <Typography variant="body2" color="primary">
                    היסטוריית עליות ({child.aliyaHistory.length})
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ pt: 0 }}>
                  <AliyaEventsList events={child.aliyaHistory} title="עליות" />
                </AccordionDetails>
              </Accordion>
            )}
          </Box>
        </ListItem>
      ))}
    </List>
  );
};
