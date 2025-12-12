import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ReadPage from './pages/ReadPage';
import CreateStoryPage from './pages/CreateStoryPage';
import { Login } from './pages/Login';
import { ChangePassword } from './pages/ChangePassword';
import { Bookshelf } from './pages/Bookshelf';
import { BenefitsPage } from './pages/BenefitsPage';
import MyVoicesPage from './pages/MyVoicesPage';
import { MemberInfoPage } from './pages/MemberInfoPage';
import { PaymentPage } from './pages/PaymentPage';

import { LoginModal } from './components/LoginModal';

const queryClient = new QueryClient();

function AppContent() {
    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/read/:id" element={<ReadPage />} />
                    <Route path="/create" element={<CreateStoryPage />} />
                    <Route path="/my-voices" element={<MyVoicesPage />} />
                    {/* /login route removed or kept as fallback? Let's keep it but ideally use modal. */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/bookshelf" element={<Bookshelf />} />
                    <Route path="/benefits" element={<BenefitsPage />} />
                    <Route path="/member-info" element={<MemberInfoPage />} />
                    <Route path="/payment" element={<PaymentPage />} />
                </Routes>
            </BrowserRouter>
            <LoginModal />
        </>
    );
}

function App() {
    return (
        <AuthProvider>
            <QueryClientProvider client={queryClient}>
                <AppContent />
            </QueryClientProvider>
        </AuthProvider>
    );
}

export default App;