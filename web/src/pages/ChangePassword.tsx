import React, { useState } from 'react';
import { api } from '../api/client';
import { Layout } from '../components/Layout';
import { useNavigate } from 'react-router-dom';

export const ChangePassword: React.FC = () => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [msg, setMsg] = useState('');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

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
        setMsg('');
        setIsError(false);

        if (newPassword !== confirmPassword) {
            setMsg('新密码两次输入不一致');
            setIsError(true);
            return;
        }

        if (!validatePassword(newPassword)) {
            setMsg('新密码太弱 (需8位+, 含大小写/数字/符号之二)');
            setIsError(true);
            return;
        }

        try {
            await api.auth.changePassword({ oldPassword, newPassword }); // Need to add to client.ts
            setMsg('修改成功！即将跳转...');
            setTimeout(() => navigate('/'), 1500);
        } catch (err: any) {
            setMsg(err.response?.data || '修改失败');
            setIsError(true);
        }
    };

    return (
        <Layout>
            <div className="h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-4 border-blue-200 relative z-10">
                    <button onClick={() => navigate('/')} className="mb-4 text-blue-500 font-bold">← 返回</button>
                    <h2 className="text-2xl font-bold text-center mb-6 text-blue-600">修改密码 🔑</h2>

                    {msg && (
                        <div className={`p-3 rounded mb-4 text-sm font-bold ${isError ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {msg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">旧密码</label>
                            <input
                                type="password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">新密码</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-bold mb-2">确认新密码</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-400 outline-none"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-xl transition-transform active:scale-95 shadow-md"
                        >
                            确认修改
                        </button>
                    </form>
                </div>
            </div>
        </Layout>
    );
};
