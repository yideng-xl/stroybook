import React from 'react';
import { Layout } from '../components/Layout';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const BenefitsPage: React.FC = () => {
    const { openLoginModal } = useAuth();
    return (
        <Layout>
            <div className="min-h-screen py-20 px-4 flex flex-col items-center">
                <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-yellow-300">
                    {/* Header */}
                    <div className="bg-yellow-100 p-8 text-center border-b-4 border-yellow-200">
                        <h1 className="text-4xl font-bold text-yellow-800 mb-2">🌟 会员权益说明 🌟</h1>
                        <p className="text-yellow-700">登录账号，开启无限魔法之旅！</p>
                    </div>

                    {/* Comparison Table */}
                    <div className="p-8">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {/* Headers */}
                            <div className="col-span-1"></div>
                            <div className="col-span-1 font-bold text-gray-500 text-xl pb-4">游客 (未登录)</div>
                            <div className="col-span-1 font-bold text-yellow-600 text-xl pb-4 flex items-center justify-center gap-2">
                                <span>👑 小小魔法师 (已登录)</span>
                            </div>

                            {/* Row 1 */}
                            <div className="col-span-1 font-bold text-gray-700 py-4 flex items-center justify-end pr-4">阅读故事</div>
                            <div className="col-span-1 bg-gray-50 rounded-xl py-4 flex items-center justify-center text-gray-500">
                                每日限 2 本
                            </div>
                            <div className="col-span-1 bg-yellow-50 rounded-xl py-4 flex items-center justify-center text-green-600 font-bold border-2 border-yellow-200 shadow-sm transform scale-105">
                                <Check size={20} className="mr-1"/> 无限畅读
                            </div>

                            {/* Row 2 */}
                            <div className="col-span-1 font-bold text-gray-700 py-4 flex items-center justify-end pr-4">阅读历史</div>
                            <div className="col-span-1 bg-gray-50 rounded-xl py-4 flex items-center justify-center text-gray-400">
                                <X size={20}/>
                            </div>
                            <div className="col-span-1 bg-yellow-50 rounded-xl py-4 flex items-center justify-center text-yellow-700 font-bold border-2 border-yellow-200 shadow-sm transform scale-105">
                                <Check size={20} className="mr-1"/> 云端同步
                            </div>

                            {/* Row 3 */}
                            <div className="col-span-1 font-bold text-gray-700 py-4 flex items-center justify-end pr-4">我的书架</div>
                            <div className="col-span-1 bg-gray-50 rounded-xl py-4 flex items-center justify-center text-gray-400">
                                <X size={20}/>
                            </div>
                            <div className="col-span-1 bg-yellow-50 rounded-xl py-4 flex items-center justify-center text-yellow-700 font-bold border-2 border-yellow-200 shadow-sm transform scale-105">
                                <Check size={20} className="mr-1"/> 永久保存进度
                            </div>

                             {/* Row 4 */}
                             <div className="col-span-1 font-bold text-gray-700 py-4 flex items-center justify-end pr-4">创作故事</div>
                             <div className="col-span-1 bg-gray-50 rounded-xl py-4 flex items-center justify-center text-gray-400">
                                 <X size={20}/>
                             </div>
                             <div className="col-span-1 bg-yellow-50 rounded-xl py-4 flex items-center justify-center text-yellow-700 font-bold border-2 border-yellow-200 shadow-sm transform scale-105">
                                 <span className="text-xs bg-yellow-200 px-2 py-1 rounded-full text-yellow-800">即将上线</span>
                             </div>

                        </div>
                    </div>

                    {/* Footer / CTA */}
                    <div className="bg-yellow-50 p-8 text-center border-t-4 border-yellow-200">
                        <button onClick={openLoginModal} className="inline-block bg-yellow-400 hover:bg-yellow-500 text-white text-xl font-bold py-3 px-12 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95">
                            立即加入我们 🚀
                        </button>
                        <div className="mt-4">
                            <Link to="/" className="text-gray-400 hover:text-gray-600 font-bold">先回首页逛逛</Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};
