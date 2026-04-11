import React from 'react';
import { Link } from 'react-router-dom';
import { FiUsers } from 'react-icons/fi';

export default function CourseCard({ course }) {
  return (
    <Link to={`/courses/${course._id}`} className="course-card">
      <div className="course-thumb">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} />
          : <div className="course-thumb-icon">📚</div>
        }
        <span className="course-cat-tag">{course.category}</span>
      </div>
      <div className="course-body">
        <h3 className="course-title">{course.title}</h3>
        <p className="course-desc">{course.description}</p>
        <div className="course-footer">
          <div className="course-teacher">
            <div className="teacher-avatar">
              {course.teacher?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="teacher-name">{course.teacher?.name}</span>
          </div>
          <div className="course-students">
            <FiUsers size={12} />
            {course.enrolledCount || 0}
          </div>
        </div>
      </div>
    </Link>
  );
}