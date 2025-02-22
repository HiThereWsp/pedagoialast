export interface LessonPlanData {
  userId: string
  title: string
  subject: string
  level: string
  topic: string
  duration: number
  learningObjectives: string[]
  materials: string[]
  activities: string[]
  assessment: string
  differentiation: string
  notes: string
  type: 'lesson-plan'
  tags: Array<{
    label: string
    color: string
    backgroundColor: string
    borderColor: string
  }>
}

export const generateLessonPlan = async (lessonPlanData: LessonPlanData) => {
  // Placeholder function for generating a lesson plan
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...lessonPlanData,
        id: Math.random().toString(),
        created_at: new Date().toISOString(),
      });
    }, 500);
  });
};

export const getLessonPlans = async (userId: string | undefined) => {
  // Placeholder function for fetching lesson plans
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockLessonPlans = [
        {
          id: Math.random().toString(),
          userId: userId,
          title: 'Introduction to React',
          subject: 'Web Development',
          level: 'Beginner',
          topic: 'React Basics',
          duration: 60,
          learningObjectives: ['Understand React components', 'Learn JSX syntax'],
          materials: ['React documentation', 'Code editor'],
          activities: ['Coding a simple React component', 'Debugging exercises'],
          assessment: 'Quiz on React concepts',
          differentiation: 'Provide additional resources for struggling learners',
          notes: 'Remember to cover state and props',
          type: 'lesson-plan',
          created_at: new Date().toISOString(),
          tags: [{
            label: 'Pédagogie',
            color: 'text-sky-500',
            backgroundColor: 'bg-sky-500/10',
            borderColor: 'border-sky-500/30',
          }]
        },
        {
          id: Math.random().toString(),
          userId: userId,
          title: 'Advanced JavaScript Concepts',
          subject: 'Web Development',
          level: 'Advanced',
          topic: 'Closures and Prototypes',
          duration: 90,
          learningObjectives: ['Master JavaScript closures', 'Understand prototype inheritance'],
          materials: ['JavaScript books', 'Online tutorials'],
          activities: ['Code review', 'Pair programming'],
          assessment: 'Coding challenge',
          differentiation: 'Offer advanced topics for further exploration',
          notes: 'Focus on practical examples',
          type: 'lesson-plan',
          created_at: new Date().toISOString(),
          tags: [{
            label: 'Pédagogie',
            color: 'text-sky-500',
            backgroundColor: 'bg-sky-500/10',
            borderColor: 'border-sky-500/30',
          }]
        }
      ];
      resolve(mockLessonPlans);
    }, 300);
  });
};
