
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AINavigation } from '@/components/AINavigation';
import OCRPage from './OCRPage';
import QualityControlPage from './QualityControlPage';
import ObjectDetectionPage from './ObjectDetectionPage';
import ObjectRecognitionPage from './ObjectRecognitionPage';
import FaceRecognitionPage from './FaceRecognitionPage';
import DatasetBuilderPage from './DatasetBuilderPage';
import RulesDatasetPage from './RulesDatasetPage';
import QuestionDatasetPage from './QuestionDatasetPage';
import DatasetsCombinerPage from './DatasetsCombinerPage';
import VehicleDetectionPage from './VehicleDetectionPage';
import VehicleRecognitionPage from './VehicleRecognitionPage';
import PlateDetectionPage from './PlateDetectionPage';
import PlateNumberExtractionPage from './PlateNumberExtractionPage';
import FeedsManagementPage from './FeedsManagementPage';
import PathOptimizationPage from './PathOptimizationPage';
import HumanDetectionPage from './HumanDetectionPage';
import SpeechRecognitionPage from './SpeechRecognitionPage';
import SpeechSynthesisPage from './SpeechSynthesisPage';
import SpeakerIdentificationPage from './SpeakerIdentificationPage';

const AIPortal = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AINavigation />
      <div className="w-full px-6 py-8">
        <Routes>
          {/* Urban */}
          <Route path="/" element={<VehicleDetectionPage />} />
          <Route path="/vehicle-detection" element={<VehicleDetectionPage />} />
          <Route path="/vehicle-recognition" element={<VehicleRecognitionPage />} />
          <Route path="/plate-detection" element={<PlateDetectionPage />} />
          <Route path="/plate-number-extraction" element={<PlateNumberExtractionPage />} />
          <Route path="/feeds-management" element={<FeedsManagementPage />} />
          <Route path="/path-optimization" element={<PathOptimizationPage />} />
          
          {/* Industrial */}
          <Route path="/ocr" element={<OCRPage />} />
          <Route path="/quality-control" element={<QualityControlPage />} />
          <Route path="/object-detection" element={<ObjectDetectionPage />} />
          <Route path="/object-recognition" element={<ObjectRecognitionPage />} />
          
          {/* People */}
          <Route path="/human-detection" element={<HumanDetectionPage />} />
          <Route path="/facial-recognition" element={<FaceRecognitionPage />} />
          
          {/* Sounds */}
          <Route path="/speech-recognition" element={<SpeechRecognitionPage />} />
          <Route path="/speech-synthesis" element={<SpeechSynthesisPage />} />
          <Route path="/speaker-identification" element={<SpeakerIdentificationPage />} />
          
          {/* Data Tools */}
          <Route path="/dataset-builder" element={<DatasetBuilderPage />} />
          <Route path="/rules-dataset" element={<RulesDatasetPage />} />
          <Route path="/question-dataset" element={<QuestionDatasetPage />} />
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
