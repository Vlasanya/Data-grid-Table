import React, { useState, useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { DataGridPremium, GridColDef } from "@mui/x-data-grid-premium";
import { RowData } from "./dataGridProCustom";

interface Episode {
  id: number;
  name: string;
  air_date: string;
  episode: string;
}

const episodeColumns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 90 },
  { field: "name", headerName: "Name", width: 250 },
  { field: "air_date", headerName: "Air Date", width: 150 },
  { field: "episode", headerName: "Episode Code", width: 150 },
];

const DetailPanelContent: React.FC<{ row: RowData }> = ({ row }) => {
  const [episodeRows, setEpisodeRows] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadEpisodeDetails = async () => {
      setLoading(true);
      const episodeUrls = row.episode;

      try {
        const episodeRequests = episodeUrls.map((url) =>
          fetch(url).then((res) => res.json()),
        );
        const episodeData = await Promise.all(episodeRequests);

        const formattedEpisodes = episodeData.map((episode) => ({
          id: episode.id,
          name: episode.name,
          air_date: episode.air_date,
          episode: episode.episode,
        }));

        setEpisodeRows(formattedEpisodes);
        console.log("Formatted Episodes:", formattedEpisodes);
      } catch (error) {
        console.error("Error fetching episode details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEpisodeDetails();
  }, [row]);

  if (loading) {
    return (
      <Box sx={{ padding: 2, backgroundColor: "#f5f5f5", marginTop: 1 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2, backgroundColor: "#f5f5f5", marginTop: 1 }}>
      <DataGridPremium
        rows={episodeRows}
        columns={episodeColumns}
        hideFooter
        autoHeight
        disableColumnMenu
        disableRowSelectionOnClick
        sx={{
          "& .MuiDataGrid-cell": {
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          },
        }}
      />
    </Box>
  );
};

export default DetailPanelContent;
