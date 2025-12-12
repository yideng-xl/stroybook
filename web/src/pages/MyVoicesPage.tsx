import React, { useEffect, useState } from 'react';
import { UserVoice } from '../types';
import { getMyVoices, uploadVoice } from '../api/voices';
import { Mic, Upload, Loader2, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';

const MyVoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [voices, setVoices] = useState<UserVoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    setLoading(true);
    try {
      const data = await getMyVoices();
      setVoices(data);
    } catch (err) {
      console.error('Failed to fetch voices', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Basic validation
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('audio/')) {
        setError('Please upload an audio file');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !newName.trim()) return;

    setUploading(true);
    setError(null);
    try {
      await uploadVoice(newName, selectedFile);
      setNewName('');
      setSelectedFile(null);
      await fetchVoices(); // Refresh list
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl relative">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-purple-600 font-bold transition-colors"
        >
          <span>←</span> 返回上一页
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center">
          <Mic className="mr-3 text-purple-600" />
          我的声音克隆
        </h1>

        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-purple-100">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">添加新声音</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">声音名称</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="例如：爸爸的声音"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">录音样本 (建议 10-20秒)</label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="voice-upload"
                />
                <label
                  htmlFor="voice-upload"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload className="mr-2 text-gray-500" />
                  {selectedFile ? selectedFile.name : '选择音频文件'}
                </label>
                <span className="text-sm text-gray-500">支持 MP3/WAV, 最大 10MB</span>
              </div>
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={uploading || !selectedFile || !newName}
              className={`w-full py-2 px-4 rounded-lg text-white font-medium transition-colors ${uploading || !selectedFile || !newName
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700'
                }`}
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin mr-2" /> 上传中...
                </span>
              ) : (
                '开始克隆'
              )}
            </button>
          </form>
        </div>

        {/* Voice List */}
        <h2 className="text-xl font-semibold mb-4 text-gray-700">已保存的声音</h2>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-3xl text-purple-600" />
          </div>
        ) : voices.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            还没有上传声音，快去添加一个吧！
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {voices.map((voice) => (
              <div key={voice.id} className="bg-white p-4 rounded-lg shadow border border-gray-100 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800">{voice.name}</h3>
                  <p className="text-xs text-gray-500">创建于: {new Date(voice.createdAt).toLocaleDateString()}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {voice.provider}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyVoicesPage;
