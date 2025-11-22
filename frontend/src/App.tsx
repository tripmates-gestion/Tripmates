import { Routes, Route } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import NavBar from './components/navbar/NavBar';
import Home from './pages/Home';
import Search from './pages/Search';
import UserProfile from './pages/UserProfile';
import BusinessProfile from './pages/BusinessPrivateProfile';
import type { AppProps } from './types/theme';
import { PAGES_ROUTE } from './constants/Pages';
import { Toolbar } from '@mui/material';
import { Outlet } from "react-router-dom";
import RoleBasedRoute from './routes/RoleBasedRoute';
import { ACCOUNT_TYPES } from './constants/Rol';
import { SnackbarProvider } from 'notistack';
import HotelPubProfile from './pages/HotelPubProfile';
import RestaurantPubProfile from './pages/RestaurantPubProfile';
import SearchTravelers from './pages/SearchTravelers';
import TravelerProfilePage from './pages/TravelerProfilePage';
import PlanInvitation from './pages/PlanInvitation';

function DefaultLayout() {
  return (
    <Container disableGutters sx={{ py: 4, px: { xs: 2, md: 2 } }}>
      <Outlet />
    </Container>
  );
}

export default function App({ mode, setMode }: AppProps) {  

  return (
    <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    autoHideDuration={2500}
    preventDuplicate
  >
    <Box>
      <NavBar
        mode={mode}
        setMode={setMode}
      />
      
      <Toolbar disableGutters sx={{ px: { xs: 2, md: 2 } }} />

      <Routes>
        {/* Public routes */}
        <Route element={<DefaultLayout />}>
          <Route path={PAGES_ROUTE.root} element={<Home />} />
          <Route path={PAGES_ROUTE.search} element={<Search />} />
          <Route path={`${PAGES_ROUTE.restaurantPublic}/:id`} element={<RestaurantPubProfile />} />
          <Route path={`${PAGES_ROUTE.hotelPublic}/:id`} element={<HotelPubProfile />} />
          <Route path={PAGES_ROUTE.searchTravelers} element={<SearchTravelers />} />
          <Route path={`${PAGES_ROUTE.userPublicProfile}/:id`} element={<TravelerProfilePage />} />
          <Route path={`${PAGES_ROUTE.acceptInvitation}/:planId`} element={<PlanInvitation />} />
        </Route>

        {/* Profile route with role-based rendering */}
        <Route element={<RoleBasedRoute allowedRoles={[ACCOUNT_TYPES.user, ACCOUNT_TYPES.business]} />}>
          <Route 
            path={PAGES_ROUTE.profile} 
            element={
              <RoleBasedRoute 
                allowedRoles={[ACCOUNT_TYPES.user, ACCOUNT_TYPES.business]}
                render={({ user }) => {
                  if (user?.role === ACCOUNT_TYPES.business) {
                    return <BusinessProfile />;
                  }
                  return <UserProfile />;
                }}
              />
            } 
          />
        </Route>
      </Routes>
    </Box>
    </SnackbarProvider>
  );
}
