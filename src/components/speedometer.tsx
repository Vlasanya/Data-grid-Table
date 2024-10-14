import React from "react";
import { Box, Typography } from "@mui/material";

interface SpeedometerProps {
  percentage: number;
}

const Speedometer: React.FC<SpeedometerProps> = ({ percentage }) => {
  const getColor = (percentage: number) => {
    if (percentage > 75) return "#FF0000";
    if (percentage > 50) return "#FF8B03";
    if (percentage > 25) return "#FFD700";
    return "#00FF00";
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 40,
      }}
    >
      <Typography
        variant="caption"
        component="div"
        color="textPrimary"
        sx={{
          fontWeight: "bold",
          fontSize: 14,
          color: getColor(percentage),
          position: "absolute",
          left: -10,
        }}
      >
        {percentage}
      </Typography>

      <svg
        width="35"
        height="30"
        viewBox="0 0 35 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 17.4997H4.66468C4.7426 15.8543 5.1665 14.2998 5.86437 12.9062L1.54286 10.3047C0.551725 12.4994 0 14.935 0 17.4997H0Z"
          fill={getColor(percentage)}
        ></path>
        <path
          d="M20.2476 0.215332L19.3433 6.98956C21.0923 7.4918 22.6705 8.39714 23.9709 9.59917L29.2603 4.54122C26.7949 2.30233 23.6877 0.758102 20.2476 0.215332Z"
          fill={getColor(percentage)}
        ></path>
        <path
          d="M2.49756 8.48592L6.94212 11.1616C7.91972 9.85584 9.16809 8.76469 10.6042 7.97138L7.24871 3.31641C5.33828 4.69951 3.71824 6.4586 2.49756 8.48592Z"
          fill={getColor(percentage)}
        ></path>
        <path
          d="M30.6961 6.00635L25.3491 11.1193C26.7028 12.9104 27.5452 15.1095 27.6584 17.4997H34.9998C34.9998 13.1006 33.3762 9.08093 30.6961 6.00635Z"
          fill={getColor(percentage)}
        ></path>
        <path
          d="M17.3267 6.60169L18.206 0.0153812C17.9717 0.00608435 17.7364 0 17.4998 0C14.4068 0 11.5018 0.803558 8.98047 2.21161L12.5256 7.12976C13.6685 6.74955 14.8909 6.54317 16.1615 6.54317C16.5549 6.54317 16.9435 6.56313 17.3267 6.60169Z"
          fill={getColor(percentage)}
        ></path>
        <path
          d="M14.3545 16.8277C14.3545 18.5651 15.7629 19.9735 17.5003 19.9735C19.2377 19.9735 20.6461 18.5651 20.6461 16.8277C20.6461 15.0902 17.5003 7.05322 17.5003 7.05322C17.5003 7.05322 14.3545 15.0903 14.3545 16.8277Z"
          fill={getColor(percentage)}
          style={{
            transform: `rotate(${(percentage / 100) * 180 - 90}deg)`,
            transformOrigin: "center 15px",
          }}
        ></path>
      </svg>
    </Box>
  );
};

export default Speedometer;
