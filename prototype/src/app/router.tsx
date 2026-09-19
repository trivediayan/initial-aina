import { Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { WelcomePage } from '@/pages/WelcomePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PlaceDetailPage } from '@/pages/PlaceDetailPage'
import { FoodPage } from '@/pages/FoodPage'
import { PlacesPage } from '@/pages/PlacesPage'
import { HiddenGemsPage } from '@/pages/HiddenGemsPage'
import { SavedPlacesPage } from '@/pages/SavedPlacesPage'
import { VisitedPlacesPage } from '@/pages/VisitedPlacesPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminRoute } from '@/components/AdminRoute'
import { AppShell } from '@/components/layout/AppShell'
import { AdminRedirectPage } from '@/pages/admin/AdminRedirectPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminPlacesPage } from '@/pages/admin/AdminPlacesPage'
import { AdminFoodPage } from '@/pages/admin/AdminFoodPage'
import { AdminHiddenGemsPage } from '@/pages/admin/AdminHiddenGemsPage'
import { AdminCategoriesPage } from '@/pages/admin/AdminCategoriesPage'
import { AdminImagesPage } from '@/pages/admin/AdminImagesPage'
import { AdminOpeningHoursPage } from '@/pages/admin/AdminOpeningHoursPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.home} element={<HomePage />} />
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.register} element={<RegisterPage />} />
      <Route path={ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
      <Route
        path={ROUTES.welcome}
        element={
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
        <Route path={ROUTES.place} element={<PlaceDetailPage />} />
        <Route path={ROUTES.food} element={<FoodPage />} />
        <Route path={ROUTES.placesHeritage} element={<PlacesPage category="heritage" />} />
        <Route path={ROUTES.placesSpiritual} element={<PlacesPage category="spiritual" />} />
        <Route path={ROUTES.placesArt} element={<PlacesPage category="art" />} />
        <Route path={ROUTES.hiddenGems} element={<HiddenGemsPage />} />
        <Route path={ROUTES.saved} element={<SavedPlacesPage />} />
        <Route path={ROUTES.visited} element={<VisitedPlacesPage />} />
        <Route path={ROUTES.profile} element={<ProfilePage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <AdminRoute />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.admin} element={<AdminRedirectPage />} />
        <Route path={ROUTES.adminDashboard} element={<AdminDashboardPage />} />
        <Route path={ROUTES.adminPlaces} element={<AdminPlacesPage />} />
        <Route path={ROUTES.adminFood} element={<AdminFoodPage />} />
        <Route path={ROUTES.adminHiddenGems} element={<AdminHiddenGemsPage />} />
        <Route path={ROUTES.adminCategories} element={<AdminCategoriesPage />} />
        <Route path={ROUTES.adminImages} element={<AdminImagesPage />} />
        <Route path={ROUTES.adminOpeningHours} element={<AdminOpeningHoursPage />} />
        <Route path={ROUTES.adminUsers} element={<AdminUsersPage />} />
      </Route>

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
