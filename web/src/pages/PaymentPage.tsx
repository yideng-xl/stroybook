import React from 'react';
import { Layout } from '../components/Layout';
import { Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PaymentPage: React.FC = () => {
    const navigate = useNavigate();
    return (
        <Layout>
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-lg border-4 border-yellow-300">
                    <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 mx-auto mb-6 animate-bounce">
                        <Rocket size={48} />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-4">Pro 会员功能即将上线</h1>
                    <p className="text-gray-500 text-lg mb-8">
                        我们正在努力开发即时支付系统。<br />
                        敬请期待更多强大的魔法功能！
                    </p>

                    <div className="bg-yellow-50 rounded-xl p-6 mb-8 text-left">
                        <h3 className="font-bold text-yellow-800 mb-2">Pro 会员预告：</h3>
                        <ul className="space-y-2 text-yellow-700">
                            <li>✨ 每日创作额度提升至 9 本</li>
                            <li>🎙️ 解锁声音克隆，让亲人的声音讲故事</li>
                            <li>🎨 更多独家绘本风格</li>
                        </ul>
                    </div>

                    <button
                        onClick={() => navigate(-1)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full transition-colors"
                    >
                        返回上一页
                    </button>
                </div>
            </div>
        </Layout>
    );
};
