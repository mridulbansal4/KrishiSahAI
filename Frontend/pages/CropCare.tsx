import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Sprout, Upload, Camera, MessageCircle } from 'lucide-react';

const CropCare: React.FC<{ lang: Language }> = ({ lang }) => {
    const t = translations[lang];
    const navigate = useNavigate();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleAskChatbot = () => {
        if (!result) return;
        const initialMessage = `I found ${result.disease} in my ${result.crop}. ${result.treatment ? 'Recommended treatment involves: ' + result.treatment.join(', ') : ''}. Can you tell me more about this disease and how to prevent it?`;

        navigate('/chat', {
            state: {
                initialMessage,
                fromCropCare: true,
                previousState: { result, preview, selectedFile }
            }
        });
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            const data = await api.postMultipart('/disease/detect', formData);
            if (data.success) {
                setResult(data.result);
            } else {
                setError(data.error || "Detection failed");
            }
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || "Failed to upload image");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            <div className="text-center py-10 bg-white rounded-[48px] border border-[#E6E6E6] shadow-xl p-6">
                <div className="w-20 h-20 bg-[#FAFAF7] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Sprout className="w-10 h-10 text-[#1F5F4A]" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-[#1E1E1E] mb-4">{t.cropCare}</h1>
                <p className="text-[#555555] font-medium text-lg max-w-xl mx-auto mb-8">{t.diseaseDetectionSub}</p>

                <div className="max-w-md mx-auto space-y-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 hover:border-[#1F5F4A] transition-colors cursor-pointer relative bg-gray-50">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {preview ? (
                            <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg shadow-md" />
                        ) : (
                            <div className="text-gray-500 flex flex-col items-center">
                                <Upload className="w-10 h-10 mb-2 text-gray-400" />
                                <p className="font-semibold">Click to upload or drag & drop</p>
                                <p className="text-sm">Supports JPG, PNG</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isLoading}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all ${!selectedFile || isLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-[#1F5F4A] hover:bg-[#184d3c] shadow-lg hover:shadow-xl'
                            }`}
                    >
                        {isLoading ? 'Analyzing...' : 'Detect Disease'}
                    </button>

                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}

                    {result && (
                        <div className="bg-[#FAFAF7] rounded-2xl p-6 border border-[#E6E6E6] text-left animate-fade-in">
                            <h3 className="text-xl font-bold text-[#1F5F4A] mb-2">Analysis Result</h3>
                            <div className="space-y-2">
                                <p><span className="font-semibold">Crop:</span> {result.crop}</p>
                                <p><span className="font-semibold">Disease:</span> {result.disease}</p>
                                <p><span className="font-semibold">Confidence:</span> {(result.confidence * 100).toFixed(1)}%</p>
                                <p><span className="font-semibold">Severity:</span> <span className={`capitalize ${result.severity === 'high' ? 'text-red-500' : 'text-yellow-600'}`}>{result.severity}</span></p>
                                {result.pathogen && <p><span className="font-semibold">Pathogen:</span> {result.pathogen}</p>}

                                {result.treatment && result.treatment.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h4 className="font-bold text-[#1E1E1E] mb-2">Recommended Treatment:</h4>
                                        <ul className="list-disc list-inside space-y-1 text-gray-700">
                                            {result.treatment.map((t: string, i: number) => (
                                                <li key={i}>{t}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                <button
                                    onClick={handleAskChatbot}
                                    className="w-full mt-6 py-3 bg-[#1F5F4A] text-white rounded-xl font-bold hover:bg-[#184d3c] transition-all flex items-center justify-center gap-2 shadow-md"
                                >
                                    <MessageCircle className="w-5 h-5" /> Ask Chatbot
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CropCare;
