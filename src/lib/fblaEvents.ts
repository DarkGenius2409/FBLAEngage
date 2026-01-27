/**
 * Official FBLA Competitive Events List
 * Source: FBLA National Competitive Events Guidelines
 */

export interface FBLAEvent {
  name: string;
  category: 'Objective Test' | 'Presentation' | 'Role Play' | 'Production' | 'Chapter Event';
  eligibleGrades: '9–12' | '9–10';
  nlcEntries: number;
}

export const FBLA_EVENTS: FBLAEvent[] = [
  // Objective Test Events (9-12)
  { name: 'Accounting', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Advanced Accounting', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Advertising', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Agribusiness', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Business Communication', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Business Law', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Computer Problem Solving', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Cybersecurity', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Data Science & AI', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Economics', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Healthcare Administration', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Human Resource Management', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Insurance & Risk Management', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Journalism', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Networking Infrastructures', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Organizational Leadership', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Personal Finance', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Project Management', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Public Administration & Management', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Real Estate', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Retail Management', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Securities & Investments', category: 'Objective Test', eligibleGrades: '9–12', nlcEntries: 4 },

  // Presentation Events (9-12)
  { name: 'Broadcast Journalism', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Business Ethics', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Business Plan', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Career Portfolio', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Coding & Programming', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Computer Game & Simulation Programming', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Data Analysis', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Digital Animation', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Digital Video Production', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Event Planning', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Financial Planning', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Financial Statement Analysis', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Future Business Educator', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Future Business Leader', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Graphic Design', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Impromptu Speaking', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Job Interview', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Mobile Application Development', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Public Service Announcement', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Public Speaking', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Sales Presentation', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Social Media Strategies', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Supply Chain Management', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Visual Design', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Website Coding & Development', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Website Design', category: 'Presentation', eligibleGrades: '9–12', nlcEntries: 4 },

  // Role Play Events (9-12)
  { name: 'Banking & Financial Systems', category: 'Role Play', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Business Management', category: 'Role Play', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Customer Service', category: 'Role Play', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Entrepreneurship', category: 'Role Play', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Hospitality & Event Management', category: 'Role Play', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'International Business', category: 'Role Play', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Management Information Systems', category: 'Role Play', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Marketing', category: 'Role Play', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Network Design', category: 'Role Play', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Parliamentary Procedure', category: 'Role Play', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Sports & Entertainment Management', category: 'Role Play', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Technology Support & Services', category: 'Role Play', eligibleGrades: '9–12', nlcEntries: 4 },

  // Production Events (9-12)
  { name: 'Computer Applications', category: 'Production', eligibleGrades: '9–12', nlcEntries: 4 },

  // Chapter Events (9-12)
  { name: 'Community Service Project', category: 'Chapter Event', eligibleGrades: '9–12', nlcEntries: 4 },
  { name: 'Local Chapter Annual Business Report', category: 'Chapter Event', eligibleGrades: '9–12', nlcEntries: 4 },

  // Introduction Events (9-10)
  { name: 'Introduction to Business Communication', category: 'Objective Test', eligibleGrades: '9–10', nlcEntries: 4 },
  { name: 'Introduction to Business Concepts', category: 'Objective Test', eligibleGrades: '9–10', nlcEntries: 4 },
  { name: 'Introduction to Business Presentation', category: 'Presentation', eligibleGrades: '9–10', nlcEntries: 4 },
  { name: 'Introduction to Business Procedures', category: 'Objective Test', eligibleGrades: '9–10', nlcEntries: 4 },
  { name: 'Introduction to FBLA', category: 'Objective Test', eligibleGrades: '9–10', nlcEntries: 4 },
  { name: 'Introduction to Information Technology', category: 'Objective Test', eligibleGrades: '9–10', nlcEntries: 4 },
  { name: 'Introduction to Marketing Concepts', category: 'Objective Test', eligibleGrades: '9–10', nlcEntries: 4 },
  { name: 'Introduction to Parliamentary Procedure', category: 'Objective Test', eligibleGrades: '9–10', nlcEntries: 4 },
  { name: 'Introduction to Programming', category: 'Presentation', eligibleGrades: '9–10', nlcEntries: 4 },
  { name: 'Introduction to Public Speaking', category: 'Presentation', eligibleGrades: '9–10', nlcEntries: 4 },
  { name: 'Introduction to Retail & Merchandising', category: 'Objective Test', eligibleGrades: '9–10', nlcEntries: 4 },
  { name: 'Introduction to Social Media Strategy', category: 'Presentation', eligibleGrades: '9–10', nlcEntries: 4 },
  { name: 'Introduction to Supply Chain Management', category: 'Objective Test', eligibleGrades: '9–10', nlcEntries: 4 },
];

/**
 * Get events by category
 */
export function getEventsByCategory(category: FBLAEvent['category']): FBLAEvent[] {
  return FBLA_EVENTS.filter(event => event.category === category);
}

/**
 * Get events by eligible grades
 */
export function getEventsByGrade(grade: FBLAEvent['eligibleGrades']): FBLAEvent[] {
  return FBLA_EVENTS.filter(event => event.eligibleGrades === grade);
}

/**
 * Get all unique categories
 */
export function getCategories(): FBLAEvent['category'][] {
  return Array.from(new Set(FBLA_EVENTS.map(event => event.category)));
}

/**
 * Search events by name
 */
export function searchEvents(query: string): FBLAEvent[] {
  const lowerQuery = query.toLowerCase();
  return FBLA_EVENTS.filter(event => 
    event.name.toLowerCase().includes(lowerQuery)
  );
}
