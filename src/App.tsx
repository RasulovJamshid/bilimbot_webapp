import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Home } from './pages/Home';
import { CourseDetail } from './pages/CourseDetail';
import { Syllabus } from './pages/Syllabus';
import { LessonView } from './pages/LessonView';
import { Settings } from './pages/Settings';
import { Progress } from './pages/Progress';
import { Help } from './pages/Help';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/syllabus" element={<Syllabus />} />
          <Route path="/courses/:courseId/lessons/:lessonId" element={<LessonView />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/help" element={<Help />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  );
}

export default App;
