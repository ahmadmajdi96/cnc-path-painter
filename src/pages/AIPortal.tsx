
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AINavigation } from '@/components/AINavigation';
import ComputerVisionPage from './ComputerVisionPage';
import OCRPage from './OCRPage';
import QualityControlPage from './QualityControlPage';
import ObjectDetectionPage from './ObjectDetectionPage';
import ObjectRecognitionPage from './ObjectRecognitionPage';
import FaceRecognitionPage from './FaceRecognitionPage';
import PlateRecognitionPage from './PlateRecognitionPage';
import NLPPage from './NLPPage';
import ChatBotsPage from './ChatBotsPage';
import DatasetBuilderPage from './DatasetBuilderPage';
import RulesDatasetPage from './RulesDatasetPage';
import DatasetsCombinerPage from './DatasetsCombinerPage';

const AIPortal = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AINavigation />
      <div className="w-full px-6 py-8">
        <Routes>
          <Route path="/" element={<ComputerVisionPage />} />
          <Route path="/computer-vision" element={<ComputerVisionPage />} />
          <Route path="/ocr" element={<OCRPage />} />
          <Route path="/quality-control" element={<QualityControlPage />} />
          <Route path="/object-detection" element={<ObjectDetectionPage />} />
          <Route path="/object-recognition" element={<ObjectRecognitionPage />} />
          <Route path="/face-recognition" element={<FaceRecognitionPage />} />
          <Route path="/plate-recognition" element={<PlateRecognitionPage />} />
          <Route path="/nlp" element={<NLPPage />} />
          <Route path="/chatbots" element={<ChatBotsPage />} />
          <Route path="/dataset-builder" element={<DatasetBuilderPage />} />
          <Route path="/rules-dataset" element={<RulesDatasetPage />} />
          <Route path="/datasets-combiner" element={<DatasetsCombinerPage />} />
          <Route path="*" element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Coming Soon</h2>
              <p className="text-gray-600">This AI service is under development.</p>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default AIPortal;
