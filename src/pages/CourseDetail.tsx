import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

/**
 * CourseDetail now redirects to Syllabus page
 * This keeps backward compatibility with existing links
 */
export function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to syllabus page
    if (courseId) {
      navigate(`/courses/${courseId}/syllabus`, { replace: true });
    }
  }, [courseId, navigate]);

  return null;
}
