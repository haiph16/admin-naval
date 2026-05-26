// material-ui
import { styled } from '@mui/material/styles';

// ==============================|| AUTHENTICATION 1 WRAPPER ||============================== //

const AuthWrapper1 = styled('div')(({ theme }) => ({
  background: ` linear-gradient( ${theme.vars.palette.primary.light} 0%, #3a82eeff  100%)`,
  minHeight: '100vh'
}));

export default AuthWrapper1;
