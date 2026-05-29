import React, { useMemo } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import { useAliyaGroups } from "../hooks/useAliyaGroups";
import { useAllPrayerCards } from "../hooks/usePrayerCard";
import { useAliyaTypes } from "../hooks/useAliyaTypes";
import { useAliyaTypeCategories } from "../hooks/useAliyaTypeCategories";
import { WithLogin } from "../components/WithLogin";
import { useUser } from "../hooks/useUser";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`debug-tabpanel-${index}`}
      aria-labelledby={`debug-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminAliyaHistoryDebugContent: React.FC = () => {
  const { data: aliyaGroups, isLoading: aliyaGroupsLoading } = useAliyaGroups();
  const { data: prayerCards, isLoading: prayerCardsLoading } = useAllPrayerCards();
  const { data: aliyaTypes, isLoading: aliyaTypesLoading } = useAliyaTypes();
  const { data: aliyaTypeCategories, isLoading: categoriesLoading } = useAliyaTypeCategories();
  const { isGabaiOrHigher } = useUser();

  const [tabValue, setTabValue] = React.useState(0);

  // Flatten aliyaGroups with assignments
  const flattenedAliyaGroups = useMemo(() => {
    if (!aliyaGroups) return [];

    const flattened: any[] = [];
    aliyaGroups.forEach((group) => {
      if (group.assignments && Object.keys(group.assignments).length > 0) {
        Object.entries(group.assignments).forEach(([aliyaTypeId, prayerId]) => {
          flattened.push({
            groupId: group.id,
            groupLabel: group.label,
            hebrewDate: group.hebrewDate,
            groupCreatedAt: group.createdAt,
            groupUpdatedAt: group.updatedAt,
            aliyaTypeId,
            assignedPrayerId: prayerId,
          });
        });
      } else {
        // If no assignments, still show the group
        flattened.push({
          groupId: group.id,
          groupLabel: group.label,
          hebrewDate: group.hebrewDate,
          groupCreatedAt: group.createdAt,
          groupUpdatedAt: group.updatedAt,
          aliyaTypeId: null,
          assignedPrayerId: null,
        });
      }
    });
    return flattened;
  }, [aliyaGroups]);

  // Create prayer card map for easier lookup
  const prayerCardMap = useMemo(() => {
    if (!prayerCards) return new Map();
    const map = new Map();
    prayerCards.forEach((card) => {
      map.set(card.id, card);
    });
    return map;
  }, [prayerCards]);

  // Create aliya type map for easier lookup
  const aliyaTypeMap = useMemo(() => {
    if (!aliyaTypes) return new Map();
    const map = new Map();
    aliyaTypes.forEach((type) => {
      map.set(type.id, type);
    });
    return map;
  }, [aliyaTypes]);

  const isLoading = aliyaGroupsLoading || prayerCardsLoading || aliyaTypesLoading || categoriesLoading;

  // Check permissions
  if (!isGabaiOrHigher) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">אין לך הרשאה לצפייה בדף זה</Alert>
      </Box>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          טוען נתונים...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1600, mx: "auto" }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Debug - Aliya History Data
      </Typography>

      <Paper>
        <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
          <Tab label="Aliya Groups with Assignments" id="debug-tab-0" />
          <Tab label="Raw Aliya Groups" id="debug-tab-1" />
          <Tab label="Prayer Cards" id="debug-tab-2" />
          <Tab label="Aliya Types" id="debug-tab-3" />
          <Tab label="Aliya Type Categories" id="debug-tab-4" />
        </Tabs>

        {/* Table 1: Aliya Groups with Assignments */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Aliya Groups with Assignments (Flattened)
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>Group ID</TableCell>
                  <TableCell>Group Label</TableCell>
                  <TableCell>Hebrew Date</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Aliya Type ID</TableCell>
                  <TableCell>Aliya Type Name</TableCell>
                  <TableCell>Assigned Prayer Card ID</TableCell>
                  <TableCell>Assigned Prayer Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flattenedAliyaGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      No aliya groups found
                    </TableCell>
                  </TableRow>
                ) : (
                  flattenedAliyaGroups.map((row, index) => {
                    const prayerCard = row.assignedPrayerId
                      ? prayerCardMap.get(row.assignedPrayerId)
                      : null;
                    const aliyaType = row.aliyaTypeId
                      ? aliyaTypeMap.get(row.aliyaTypeId)
                      : null;

                    return (
                      <TableRow
                        key={index}
                        sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } }}
                      >
                        <TableCell>{row.groupId}</TableCell>
                        <TableCell>{row.groupLabel}</TableCell>
                        <TableCell>
                          {row.hebrewDate
                            ? `${row.hebrewDate.day}/${row.hebrewDate.month}/${row.hebrewDate.year}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {row.groupCreatedAt
                            ? new Date(row.groupCreatedAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          {row.groupUpdatedAt
                            ? new Date(row.groupUpdatedAt).toLocaleDateString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>{row.aliyaTypeId || "N/A"}</TableCell>
                        <TableCell>{aliyaType?.displayName || "N/A"}</TableCell>
                        <TableCell>{row.assignedPrayerId || "N/A"}</TableCell>
                        <TableCell>
                          {prayerCard
                            ? `${prayerCard.prayer.firstName} ${prayerCard.prayer.lastName}`
                            : "N/A"}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Table 2: Raw Aliya Groups */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Raw Aliya Groups
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Hebrew Date</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                  <TableCell>Assignments (JSON)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!aliyaGroups || aliyaGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      No aliya groups found
                    </TableCell>
                  </TableRow>
                ) : (
                  aliyaGroups.map((group) => (
                    <TableRow
                      key={group.id}
                      sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } }}
                    >
                      <TableCell>{group.id}</TableCell>
                      <TableCell>{group.label}</TableCell>
                      <TableCell>
                        {group.hebrewDate
                          ? `${group.hebrewDate.day}/${group.hebrewDate.month}/${group.hebrewDate.year}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(group.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(group.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Box
                          component="pre"
                          sx={{
                            maxWidth: 300,
                            maxHeight: 100,
                            overflow: "auto",
                            fontSize: "0.75rem",
                            backgroundColor: "#f0f0f0",
                            p: 1,
                            borderRadius: 1,
                          }}
                        >
                          {JSON.stringify(group.assignments, null, 2)}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Table 3: Prayer Cards */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Prayer Cards
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>ID</TableCell>
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>Hebrew Birth Date</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Children Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!prayerCards || prayerCards.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      No prayer cards found
                    </TableCell>
                  </TableRow>
                ) : (
                  prayerCards.map((card) => (
                    <TableRow
                      key={card.id}
                      sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } }}
                    >
                      <TableCell>{card.id}</TableCell>
                      <TableCell>{card.prayer.firstName}</TableCell>
                      <TableCell>{card.prayer.lastName}</TableCell>
                      <TableCell>
                        {card.prayer.hebrewBirthDate
                          ? `${card.prayer.hebrewBirthDate.day}/${card.prayer.hebrewBirthDate.month}/${card.prayer.hebrewBirthDate.year}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>{card.prayer.phoneNumber || "N/A"}</TableCell>
                      <TableCell>{card.prayer.email || "N/A"}</TableCell>
                      <TableCell>{card.children?.length || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Table 4: Aliya Types */}
        <TabPanel value={tabValue} index={3}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Aliya Types
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Display Name</TableCell>
                  <TableCell>Weight</TableCell>
                  <TableCell>Enabled</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Display Order</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!aliyaTypes || aliyaTypes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      No aliya types found
                    </TableCell>
                  </TableRow>
                ) : (
                  aliyaTypes.map((type) => (
                    <TableRow
                      key={type.id}
                      sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } }}
                    >
                      <TableCell>{type.id}</TableCell>
                      <TableCell>{type.displayName}</TableCell>
                      <TableCell>{type.weight}</TableCell>
                      <TableCell>{type.enabled ? "Yes" : "No"}</TableCell>
                      <TableCell>{type.description || "N/A"}</TableCell>
                      <TableCell>{type.displayOrder || "N/A"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Table 5: Aliya Type Categories */}
        <TabPanel value={tabValue} index={4}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Aliya Type Categories
          </Typography>
          <TableContainer component={Paper}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>ID</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Display Order</TableCell>
                  <TableCell>Aliya Type IDs</TableCell>
                  <TableCell>Created At</TableCell>
                  <TableCell>Updated At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!aliyaTypeCategories || aliyaTypeCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      No aliya type categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  aliyaTypeCategories.map((category) => (
                    <TableRow
                      key={category.id}
                      sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fafafa" } }}
                    >
                      <TableCell>{category.id}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.description || "N/A"}</TableCell>
                      <TableCell>{category.displayOrder || "N/A"}</TableCell>
                      <TableCell>
                        {category.aliyaTypeIds && category.aliyaTypeIds.length > 0
                          ? category.aliyaTypeIds.join(", ")
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(category.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(category.updatedAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>
    </Box>
  );
};

const AdminAliyaHistoryDebug: React.FC = () => {
  return (
    <WithLogin>
      <AdminAliyaHistoryDebugContent />
    </WithLogin>
  );
};

export default AdminAliyaHistoryDebug;
