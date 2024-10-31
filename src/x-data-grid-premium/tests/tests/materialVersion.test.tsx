import materialPackageJson from '@mui/material/package.json';
import { checkMaterialVersion } from '../test/utils/checkMaterialVersion';
import packageJson from '../../../../package.json';

const modifiedPackageJson = {
  ...packageJson,
  devDependencies: {
    ...packageJson.devDependencies,
    "@mui/material": packageJson.dependencies["@mui/material"] || "your_version_here"
  }
};

checkMaterialVersion({ packageJson: modifiedPackageJson, materialPackageJson });
