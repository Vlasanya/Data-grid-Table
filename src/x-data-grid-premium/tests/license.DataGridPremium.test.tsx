// import * as React from "react";
// // import addYears from "date-fns/addYears";
// // import { expect } from 'chai';
// import { render, screen, waitFor } from "@testing-library/react";
// import { DataGridPremium } from "../DataGridPremium/DataGridPremium";
// import { generateLicense, LicenseInfo } from "@mui/x-license";

// describe("<DataGridPremium /> - License", () => {
//   // it("should throw out of scope error when using DataGridPremium with a pro license", () => {
//   //   const expiryDate = new Date();
//   //   expiryDate.setFullYear(expiryDate.getFullYear() + 1);
//   //   LicenseInfo.setLicenseKey(
//   //     generateLicense({
//   //       expiryDate,
//   //       orderNumber: "Test",
//   //       licenseModel: "subscription",
//   //       planScope: "pro",
//   //       planVersion: "initial",
//   //     })
//   //   );
//   //   expect(() =>
//   //     render(<DataGridPremium columns={[]} rows={[]} autoHeight />)
//   //   ).toThrowError(new Error("MUI X: License key plan mismatch"));
//   // });

//   // it("should render watermark when the license is missing", async () => {
//   //   LicenseInfo.setLicenseKey("");

//   //   expect(() =>
//   //     render(<DataGridPremium columns={[]} rows={[]} autoHeight />)
//   //   ).toThrowError(new Error("MUI X: Missing license key."));

//   //   await waitFor(() => {
//   //     expect(screen.getByText("MUI X Missing license key")).not.toEqual(null);
//   //   });
//   // });
// });
