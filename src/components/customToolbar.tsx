import React from "react";
import {
  useGridApiContext,
  GridPreferencePanelsValue,
} from "@mui/x-data-grid-premium";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
interface CustomToolbarProps {
  rowCount: number;
}
const CustomExportButton: React.FC = () => {
  const apiRef = useGridApiContext();

  const handleExport = () => {
    apiRef.current.exportDataAsCsv();
  };

  return (
    <Tooltip title="Export">
      <IconButton onClick={handleExport} aria-label="Export" sx={{ width: 50 }}>
        <Box
          component="svg"
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.27672 3.14648L5.34375 7.67588V9.99056H6.30796V8.33989H9.97936V4.1124H17.6911V9.99056H18.657V3.14648H9.27672Z"
            fill="#4D1A69"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.3068 17.0487H17.6902V20.1805L6.3068 20.1694V17.0487ZM14.1088 11.9868H14.9637L15.7996 14.6761L16.6323 11.9868H17.4639L16.1637 15.8195H15.4076L14.1088 11.9868ZM8.29032 11.8595C8.44284 11.8567 8.59478 11.8715 8.7402 11.9021C9.49566 12.0575 9.87283 12.5826 9.95888 13.2441H9.15741C9.0793 12.8374 8.68254 12.515 8.26391 12.5534C7.95945 12.5548 7.66209 12.7294 7.53173 13.0089C7.32327 13.4292 7.32327 13.9214 7.38859 14.3759C7.44284 14.7158 7.61154 15.1021 7.96655 15.2026C8.54963 15.367 9.02591 15.1305 9.15741 14.5031H9.95888C9.86459 15.0592 9.52463 15.5991 8.98871 15.8195C8.48572 16.0237 7.88817 15.9896 7.41046 15.7323C6.86289 15.4258 6.57462 14.7973 6.54451 14.189C6.50191 13.5517 6.60274 12.8652 7.05971 12.3685C7.3778 12.0223 7.83648 11.8655 8.29032 11.8595ZM12.0745 11.8507C12.5079 11.8521 12.9444 11.9734 13.2551 12.2838C13.4727 12.5028 13.5851 12.8093 13.5939 13.1137H12.8305C12.82 12.8578 12.6425 12.6136 12.3835 12.5644C12.1083 12.5102 11.7947 12.4983 11.5456 12.6459C11.3122 12.7956 11.3182 13.1978 11.5746 13.3205C11.8765 13.4804 12.2236 13.5088 12.5465 13.609C12.8839 13.7113 13.2565 13.7999 13.5016 14.0705C13.728 14.3634 13.7589 14.7703 13.6703 15.1191C13.5476 15.5289 13.1617 15.8041 12.7561 15.8928C12.3539 15.9922 11.9276 15.9672 11.5255 15.874C11.1245 15.7851 10.7694 15.5306 10.6274 15.1029C10.5885 14.9907 10.553 14.6712 10.553 14.6712H11.3284C11.3196 14.9623 11.5601 15.2006 11.8325 15.2657C12.1211 15.3338 12.4468 15.3293 12.7112 15.1841C12.9498 15.0552 13.0103 14.6959 12.8345 14.4949C12.6081 14.2878 12.281 14.279 11.9984 14.2006C11.5885 14.0998 11.1341 14.0066 10.8444 13.6724C10.6226 13.3986 10.6016 13.0098 10.6803 12.6783C10.7879 12.2375 11.2199 11.9623 11.6459 11.8868C11.7862 11.8641 11.9299 11.8507 12.0745 11.8507ZM4.23438 10.7559V17.0484H5.34258V21.1339L18.6556 21.1469V17.0487H19.7649V10.7559H4.23438Z"
            fill="#4D1A69"
          />
        </Box>
      </IconButton>
    </Tooltip>
  );
};

const CustomColumnsButton: React.FC = () => {
  const apiRef = useGridApiContext();

  const handleShowColumns = () => {
    apiRef.current.showPreferences(GridPreferencePanelsValue.columns);
  };

  return (
    <Tooltip title="Columns">
      <IconButton
        onClick={handleShowColumns}
        aria-label="Columns"
        sx={{
          width: 50,
        }}
      >
        <Box
          component="svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3.50003 18.5V5.5H20.4846V18.5H3.50003ZM5.00001 17H8.66158V6.99998H5.00001V17ZM10.1615 17H13.8231V6.99998H10.1615V17ZM15.3231 17H18.9846V6.99998H15.3231V17Z"
            fill="#4D1A69"
          />
        </Box>
      </IconButton>
    </Tooltip>
  );
};
const CustomToolbar: React.FC<CustomToolbarProps> = ({ rowCount }) => {
  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "space-between", p: 1 }}>
        <Typography sx={{ alignSelf: "center", text: "bold", ml: 1 }}>
          {rowCount} Results
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <CustomExportButton />
          <CustomColumnsButton />
          <IconButton sx={{ ml: 1 }}>
            <TuneIcon
              sx={{
                "& path": {
                  fill: "#4D1A69",
                },
              }}
            />
          </IconButton>
        </Box>
      </Box>
    </>
  );
};

export default CustomToolbar;
