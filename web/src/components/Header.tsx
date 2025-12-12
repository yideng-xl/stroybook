import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, LogOut, Menu, X, PlusCircle, Mic } from 'lucide-react';

export const Header: React.FC = () => {
    const { user, isAuthenticated, logout, openLoginModal } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showPendingModal, setShowPendingModal] = useState(false);

    const handleVoiceCheck = () => {
        // Future logic: check if user is Pro. For now, always show "Pending" modal as requested.
        setShowPendingModal(true);
    };

    return (
        <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-yellow-100">
            {/* Pending Modal */}
            {showPendingModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPendingModal(false)}></div>
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm relative z-10 text-center animate-bounce-in border-4 border-yellow-300">
                        <button onClick={() => setShowPendingModal(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4 text-yellow-600">
                            <Mic size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">功能待上线</h3>
                        <p className="text-gray-600 mb-6">声音克隆功能正在加急开发中，敬请期待！</p>
                        <button onClick={() => setShowPendingModal(false)} className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 px-6 rounded-full shadow-md">
                            我知道了
                        </button>
                    </div>
                </div>
            )}
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2 text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform">
                    <BookOpen className="text-yellow-500" strokeWidth={2.5} />
                    <span>StoryBook</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link to="/" className="text-gray-600 hover:text-yellow-600 font-medium transition-colors">首页</Link>
                    <Link to="/benefits" className="text-gray-600 hover:text-yellow-600 font-medium transition-colors">会员权益</Link>

                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/create')}
                                className="flex items-center px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full font-bold shadow-md transition-all transform hover:-translate-y-0.5"
                            >
                                <PlusCircle size={18} className="mr-1" />
                                写故事
                            </button>
                            <button
                                onClick={handleVoiceCheck}
                                className="flex items-center px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-full font-bold transition-colors"
                            >
                                <Mic size={18} className="mr-1" />
                                声音克隆
                            </button>

                            <div className="relative group">
                                <button className="flex items-center space-x-2 text-gray-700 hover:text-yellow-600 font-medium">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 border border-yellow-200">
                                        <User size={18} />
                                    </div>
                                    <span>{user?.username}</span>
                                </button>
                                {/* Dropdown */}
                                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block animate-fade-in-up">
                                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2">
                                        <Link to="/member-info" className="block px-4 py-2 text-gray-700 hover:bg-yellow-50 text-sm font-bold text-yellow-600">会员中心</Link>
                                        <Link to="/bookshelf" className="block px-4 py-2 text-gray-700 hover:bg-yellow-50">我的书架</Link>
                                        <Link to="/change-password" className="block px-4 py-2 text-gray-700 hover:bg-yellow-50">修改密码</Link>
                                        <div className="h-px bg-gray-100 my-1"></div>
                                        <button onClick={logout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 flex items-center">
                                            <LogOut size={16} className="mr-2" />
                                            退出登录
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => openLoginModal('login')}
                                className="text-gray-600 hover:text-yellow-600 font-bold"
                            >
                                登录
                            </button>
                            <button
                                onClick={() => openLoginModal('register')}
                                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-white rounded-full font-bold shadow-md transition-all transform hover:-translate-y-0.5"
                            >
                                免费注册
                            </button>
                        </div>
                    )}
                </nav>

                {/* Mobile Menu Button */}
                <button className="md:hidden text-gray-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 p-4 absolute w-full shadow-lg">
                    <nav className="flex flex-col space-y-4">
                        <Link to="/" className="text-gray-700 font-medium p-2 hover:bg-yellow-50 rounded-lg">首页</Link>
                        <Link to="/benefits" className="text-gray-700 font-medium p-2 hover:bg-yellow-50 rounded-lg">会员权益</Link>
                        {isAuthenticated ? (
                            <>
                                <Link to="/create" className="text-yellow-600 font-bold p-2 hover:bg-yellow-50 rounded-lg flex items-center">
                                    <PlusCircle size={18} className="mr-2" /> 写故事
                                </Link>
                                <button onClick={handleVoiceCheck} className="text-purple-600 font-bold p-2 hover:bg-purple-50 rounded-lg flex items-center w-full text-left">
                                    <Mic size={18} className="mr-2" /> 声音克隆
                                </button>
                                <Link to="/bookshelf" className="text-gray-700 p-2 hover:bg-yellow-50 rounded-lg">我的书架</Link>
                                <button onClick={logout} className="text-left text-red-500 p-2 hover:bg-red-50 rounded-lg flex items-center">
                                    <LogOut size={18} className="mr-2" /> 退出登录
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col space-y-3 pt-2">
                                <button onClick={() => openLoginModal('login')} className="w-full py-2 border border-yellow-400 text-yellow-600 rounded-lg font-bold">登录</button>
                                <button onClick={() => openLoginModal('register')} className="w-full py-2 bg-yellow-400 text-white rounded-lg font-bold">注册</button>
                            </div>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};
