
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
import LocationsDatasetPage from './LocationsDatasetPage';
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
import NLPPage from './NLPPage';
import ChatBotsPage from './ChatBotsPage';

interface AIPortalProps {
  projectId?: string;
  hideNavigation?: boolean;
}

const AIPortal = ({ projectId, hideNavigation }: AIPortalProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {!hideNavigation && <AINavigation />}
      <div className="w-full px-6 py-8">
        <Routes>
          {/* Urban */}
          <Route path="/" element={<VehicleDetectionPage projectId={projectId} />} />
          <Route path="/vehicle-detection" element={<VehicleDetectionPage projectId={projectId} />} />
          <Route path="/vehicle-recognition" element={<VehicleRecognitionPage projectId={projectId} />} />
          <Route path="/plate-detection" element={<PlateDetectionPage projectId={projectId} />} />
          <Route path="/plate-number-extraction" element={<PlateNumberExtractionPage projectId={projectId} />} />
          <Route path="/feeds-management" element={<FeedsManagementPage projectId={projectId} />} />
          <Route path="/path-optimization" element={<PathOptimizationPage projectId={projectId} />} />
          
          {/* Industrial */}
          <Route path="/ocr" element={<OCRPage projectId={projectId} />} />
          <Route path="/quality-control" element={<QualityControlPage projectId={projectId} />} />
          <Route path="/object-detection" element={<ObjectDetectionPage projectId={projectId} />} />
          <Route path="/object-recognition" element={<ObjectRecognitionPage projectId={projectId} />} />
          
          {/* People */}
          <Route path="/human-detection" element={<HumanDetectionPage projectId={projectId} />} />
          <Route path="/facial-recognition" element={<FaceRecognitionPage projectId={projectId} />} />
          
          {/* Sounds */}
          <Route path="/speech-recognition" element={<SpeechRecognitionPage projectId={projectId} />} />
          <Route path="/speech-synthesis" element={<SpeechSynthesisPage projectId={projectId} />} />
          <Route path="/speaker-identification" element={<SpeakerIdentificationPage projectId={projectId} />} />
          
          {/* Data Tools */}
          <Route path="/dataset-builder" element={<DatasetBuilderPage projectId={projectId} />} />
          <Route path="/rules-dataset" element={<RulesDatasetPage projectId={projectId} />} />
          <Route path="/question-dataset" element={<QuestionDatasetPage projectId={projectId} />} />
          <Route path="/datasets-combiner" element={<DatasetsCombinerPage projectId={projectId} />} />
          <Route path="/locations-dataset" element={<LocationsDatasetPage projectId={projectId} />} />
          
          {/* Language AI */}
          <Route path="/nlp" element={<NLPPage projectId={projectId} />} />
          <Route path="/chatbots" element={<ChatBotsPage projectId={projectId} />} />
          
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
