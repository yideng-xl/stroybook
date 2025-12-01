import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { X } from 'lucide-react';

export const LoginModal: React.FC = () => {
    const { isLoginModalOpen, closeLoginModal, login } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');

    // Reset state when modal opens
    useEffect(() => {
        if (isLoginModalOpen) {
            setError('');
            // Optional: reset fields
        }
    }, [isLoginModalOpen]);

    if (!isLoginModalOpen) return null;

    const validatePassword = (pwd: string) => {
        if (pwd.length < 8) return false;
        let categories = 0;
        if (/[A-Z]/.test(pwd)) categories++;
        if (/[a-z]/.test(pwd)) categories++;
        if (/\d/.test(pwd)) categories++;
        if (/[^a-zA-Z0-9]/.test(pwd)) categories++;
        return categories >= 2;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isLogin) {
            if (password !== confirmPassword) {
                setError('两次输入的密码不一致');
                return;
            }
            if (!validatePassword(password)) {
                setError('密码需至少8位，且包含大写/小写/数字/符号中的两种');
                return;
            }
        }

        try {
            if (isLogin) {
                const res = await api.auth.login({ username, password });
                login(res.data.token, { id: res.data.id, username: res.data.username });
                // Modal closes automatically via context logic
            } else {
                await api.auth.register({ username, password });
                alert('注册成功，请登录');
                setIsLogin(true);
                setPassword('');
                setConfirmPassword('');
            }
        } catch (err: any) {
            setError(err.response?.data || '操作失败，请检查网络或账号');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeLoginModal}></div>
            
            {/* Modal Content */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border-4 border-yellow-300 relative z-10 overflow-hidden animate-fade-in-up">
                <button onClick={closeLoginModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <X size={24} />
                </button>

                <div className="p-8">
                    <h2 className="text-3xl font-bold text-center mb-6 text-yellow-600">
                        {isLogin ? '欢迎回来' : '加入我们'} 🏰
                    </h2>
                    
                    {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm font-bold">{error}</div>}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">用户名</label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-yellow-400 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">密码</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-yellow-400 outline-none"
                                required
                                placeholder={!isLogin ? "8位以上，含大小写/数字/符号之二" : ""}
                            />
                        </div>
                        
                        {!isLogin && (
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">确认密码</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-yellow-400 outline-none"
                                    required
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-md"
                        >
                            {isLogin ? '登 录' : '注 册'}
                        </button>
                    </form>
                    <div className="mt-6 text-center">
                        <button
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-yellow-600 hover:underline font-medium"
                        >
                            {isLogin ? '没有账号？免费注册' : '已有账号？去登录'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
