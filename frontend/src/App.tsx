import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  GraduationCap,
  Briefcase,
  MapPin,
  Linkedin,
  Mail,
  User,
  PlusCircle,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Edit2,
  RefreshCw
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

interface Alumnus {
  _id: string;
  name: string;
  email: string;
  graduationYear: number;
  major: string;
  currentRole: string;
  company: string;
  location: string;
  linkedIn?: string;
  bio?: string;
  skills: string[];
  matchPercentage?: number;
  matchedSkills?: string[];
}

function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'directory' | 'register' | 'mentor'>('directory');

  // Alumni Directory State
  const [alumni, setAlumni] = useState<Alumnus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  // Form State
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [formEmailSearch, setFormEmailSearch] = useState('');
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGraduationYear, setFormGraduationYear] = useState('');
  const [formMajor, setFormMajor] = useState('');
  const [formCurrentRole, setFormCurrentRole] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formLinkedIn, setFormLinkedIn] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formSkills, setFormSkills] = useState('');

  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Mentor Match State
  const [mentorSkillsQuery, setMentorSkillsQuery] = useState('');
  const [matchedMentors, setMatchedMentors] = useState<Alumnus[]>([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchingError, setMatchingError] = useState<string | null>(null);
  const [hasSearchedMentors, setHasSearchedMentors] = useState(false);

  // Fetch all alumni
  const fetchAlumni = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/alumni`);
      if (!response.ok) {
        throw new Error(`Failed to load directory: ${response.statusText}`);
      }
      const data = await response.json();
      setAlumni(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching alumni data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  // Filter lists populated dynamically
  const uniqueMajors = Array.from(new Set(alumni.map(al => al.major).filter(Boolean))).sort();
  const uniqueYears = Array.from(new Set(alumni.map(al => al.graduationYear).filter(Boolean))).sort((a, b) => b - a);

  // Filtered Alumni for Directory
  const filteredAlumni = alumni.filter(al => {
    const matchesSearch =
      searchQuery === '' ||
      al.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      al.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      al.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      al.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
      al.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMajor = selectedMajor === '' || al.major === selectedMajor;
    const matchesYear = selectedYear === '' || al.graduationYear.toString() === selectedYear;

    return matchesSearch && matchesMajor && matchesYear;
  });

  // Pre-fill profile for editing
  const handleEditProfile = (al: Alumnus) => {
    setIsUpdateMode(true);
    setFormId(al._id);
    setFormName(al.name);
    setFormEmail(al.email);
    setFormGraduationYear(al.graduationYear.toString());
    setFormMajor(al.major);
    setFormCurrentRole(al.currentRole);
    setFormCompany(al.company);
    setFormLocation(al.location);
    setFormLinkedIn(al.linkedIn || '');
    setFormBio(al.bio || '');
    setFormSkills(al.skills.join(', '));
    setFormSuccess(null);
    setFormError(null);
    setActiveTab('register');
  };

  // Find profile by email (in update mode when no card is clicked)
  const handleSearchProfileByEmail = () => {
    if (!formEmailSearch.trim()) {
      setFormError('Please enter an email to search.');
      return;
    }
    const profile = alumni.find(
      al => al.email.toLowerCase().trim() === formEmailSearch.toLowerCase().trim()
    );

    if (profile) {
      handleEditProfile(profile);
      setFormSuccess('Profile loaded successfully! You can now update your details below.');
    } else {
      setFormError('No profile found with that email address. You can register a new profile.');
    }
  };

  // Clear/Reset Profile Form
  const resetForm = () => {
    setIsUpdateMode(false);
    setFormId(null);
    setFormEmailSearch('');
    setFormName('');
    setFormEmail('');
    setFormGraduationYear('');
    setFormMajor('');
    setFormCurrentRole('');
    setFormCompany('');
    setFormLocation('');
    setFormLinkedIn('');
    setFormBio('');
    setFormSkills('');
    setFormSuccess(null);
    setFormError(null);
  };

  // Form submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    // Validate fields
    if (!formName.trim() || !formEmail.trim() || !formGraduationYear || !formMajor.trim() || !formCurrentRole.trim() || !formCompany.trim() || !formLocation.trim()) {
      setFormError('All fields marked with * are required.');
      return;
    }

    setFormSubmitting(true);
    const payload = {
      name: formName.trim(),
      email: formEmail.trim(),
      graduationYear: parseInt(formGraduationYear),
      major: formMajor.trim(),
      currentRole: formCurrentRole.trim(),
      company: formCompany.trim(),
      location: formLocation.trim(),
      linkedIn: formLinkedIn.trim(),
      bio: formBio.trim(),
      skills: formSkills
    };

    try {
      let url = `${API_BASE}/alumni`;
      let method = 'POST';

      if (isUpdateMode && formId) {
        url = `${API_BASE}/alumni/${formId}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong.');
      }

      setFormSuccess(
        isUpdateMode
          ? 'Profile updated successfully!'
          : 'Registration completed successfully! Your profile is now live.'
      );

      // Refresh directory data
      await fetchAlumni();

      // If registered new, we can reset the form. If updated, keep current view
      if (!isUpdateMode) {
        resetForm();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit form.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Find My Mentor handler
  const handleFindMentors = async (e: React.FormEvent) => {
    e.preventDefault();
    setMatchingError(null);
    setMatchingLoading(true);
    setHasSearchedMentors(true);

    try {
      const response = await fetch(
        `${API_BASE}/match?skills=${encodeURIComponent(mentorSkillsQuery)}`
      );
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to calculate matches.');
      }
      const data = await response.json();
      setMatchedMentors(data);
    } catch (err: any) {
      setMatchingError(err.message || 'Failed to search for mentors.');
    } finally {
      setMatchingLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Banner */}
      <header className="bg-slate-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-lg text-white">
              <GraduationCap className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">AlumniConnect</h1>
              <p className="text-xs text-slate-400">Bridging the gap between students and alumni mentors</p>
            </div>
          </div>
          <nav className="flex space-x-1 bg-slate-800 p-1.5 rounded-lg">
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'directory'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Alumni Directory
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setFormError(null);
                setFormSuccess(null);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'register'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Register / Update Profile
            </button>
            <button
              onClick={() => setActiveTab('mentor')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'mentor'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              Find My Mentor
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Tab 1: Alumni Directory */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              
              {/* Search input */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search alumni by name, role, company, or skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-700 text-sm"
                />
              </div>

              {/* Filters dropdowns */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex items-center">
                  <Filter className="absolute left-3 text-slate-400 h-4 w-4 pointer-events-none" />
                  <select
                    value={selectedMajor}
                    onChange={(e) => setSelectedMajor(e.target.value)}
                    className="pl-9 pr-8 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[160px]"
                  >
                    <option value="">All Majors</option>
                    {uniqueMajors.map(major => (
                      <option key={major} value={major}>{major}</option>
                    ))}
                  </select>
                </div>

                <div className="relative flex items-center">
                  <GraduationCap className="absolute left-3 text-slate-400 h-4 w-4 pointer-events-none" />
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="pl-9 pr-8 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none min-w-[140px]"
                  >
                    <option value="">All Years</option>
                    {uniqueYears.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                
                {/* Reset button */}
                {(searchQuery || selectedMajor || selectedYear) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedMajor('');
                      setSelectedYear('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium px-2 py-2"
                  >
                    Clear Filters
                  </button>
                )}

                <button
                  onClick={fetchAlumni}
                  title="Reload Directory"
                  className="p-2.5 rounded-lg border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-slate-50 flex items-center justify-center transition-colors"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Error state */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Loading state */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 text-sm font-medium">Loading directory...</p>
              </div>
            ) : filteredAlumni.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-100">
                <User className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-semibold text-slate-700">No Alumni Profiles Found</h3>
                <p className="text-slate-500 mt-1 max-w-md mx-auto text-sm">
                  We couldn't find any profiles matching your criteria. Try adjusting your search query, clearing filters, or registering a new profile!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAlumni.map((al) => (
                  <div
                    key={al._id}
                    className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between overflow-hidden relative group"
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {al.name}
                          </h3>
                          <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                            <GraduationCap className="h-3.5 w-3.5" />
                            <span>Class of {al.graduationYear} &bull; {al.major}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditProfile(al)}
                          title="Edit Profile"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Current Role & Company */}
                      <div className="flex items-center gap-2 text-slate-700 text-sm mb-2">
                        <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                        <span className="font-semibold">{al.currentRole}</span>
                        <span className="text-slate-400">at</span>
                        <span className="font-semibold text-blue-600">{al.company}</span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>{al.location}</span>
                      </div>

                      {/* Bio */}
                      {al.bio && (
                        <p className="text-slate-600 text-xs line-clamp-3 bg-slate-50 p-2.5 rounded-lg mb-4 border border-slate-100 italic">
                          "{al.bio}"
                        </p>
                      )}

                      {/* Skills Tags */}
                      {al.skills && al.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {al.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer Contact Details */}
                    <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                      <a
                        href={`mailto:${al.email}`}
                        className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors font-medium"
                      >
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span>Contact Email</span>
                      </a>

                      {al.linkedIn ? (
                        <a
                          href={al.linkedIn.startsWith('http') ? al.linkedIn : `https://${al.linkedIn}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors font-medium"
                        >
                          <Linkedin className="h-4 w-4 text-slate-400" />
                          <span>LinkedIn</span>
                        </a>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1.5">
                          <Linkedin className="h-4 w-4 text-slate-200" />
                          <span className="italic text-[10px]">No LinkedIn</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile Registration/Form */}
        {activeTab === 'register' && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold">
                  {isUpdateMode ? 'Update Alumni Profile' : 'Register New Alumni Profile'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isUpdateMode
                    ? `Editing profile for ${formName}`
                    : 'Add your details to join the directory and match with student mentees.'}
                </p>
              </div>
              {isUpdateMode && (
                <button
                  onClick={resetForm}
                  className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
                >
                  Create New Profile
                </button>
              )}
            </div>

            {/* Email Search Box when in "Update Profile" mode without direct link from card */}
            {!isUpdateMode && (
              <div className="bg-slate-50 border-b border-slate-100 p-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Already registered? Find and update your profile
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4.5 w-4.5" />
                    <input
                      type="email"
                      placeholder="Enter registered email address..."
                      value={formEmailSearch}
                      onChange={(e) => setFormEmailSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearchProfileByEmail}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors font-semibold shadow-sm flex items-center gap-1.5"
                  >
                    Load Profile
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {/* Form alerts */}
              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{formError}</p>
                </div>
              )}
              {formSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{formSuccess}</p>
                </div>
              )}

              {/* Form fields layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="jane.doe@example.com"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Graduation Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1900"
                    max="2100"
                    value={formGraduationYear}
                    onChange={(e) => setFormGraduationYear(e.target.value)}
                    placeholder="2020"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Major <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formMajor}
                    onChange={(e) => setFormMajor(e.target.value)}
                    placeholder="Computer Science"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Current Job Role <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCurrentRole}
                    onChange={(e) => setFormCurrentRole(e.target.value)}
                    placeholder="Senior Software Engineer"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Company / Organization <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="Google"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Location <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="Mountain View, CA"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={formLinkedIn}
                    onChange={(e) => setFormLinkedIn(e.target.value)}
                    placeholder="https://linkedin.com/in/janedoe"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={formSkills}
                  onChange={(e) => setFormSkills(e.target.value)}
                  placeholder="React, TypeScript, Tailwind CSS, Node.js"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  List skills separated by commas (e.g. Python, SQL, Project Management) to help students find you.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Bio / Professional Summary
                </label>
                <textarea
                  rows={3}
                  value={formBio}
                  onChange={(e) => setFormBio(e.target.value)}
                  placeholder="Tell students about yourself, what you do, and what areas you are excited to mentor in."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                {isUpdateMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm hover:bg-slate-50 transition-colors font-semibold"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors font-semibold shadow-sm flex items-center gap-1.5 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {formSubmitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-4 w-4" />
                      <span>{isUpdateMode ? 'Save Changes' : 'Register Profile'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Find My Mentor */}
        {activeTab === 'mentor' && (
          <div className="space-y-6">
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-6 py-6 text-center">
                <Sparkles className="h-8 w-8 mx-auto text-blue-200 mb-2" />
                <h2 className="text-xl font-bold">Find Your Alumni Mentor</h2>
                <p className="text-sm text-blue-100 mt-1 max-w-lg mx-auto">
                  Enter the skills or topics you'd like to learn. Our portal uses AI-driven matching to score and rank alumni based on overlap with your interests!
                </p>
              </div>

              <form onSubmit={handleFindMentors} className="p-6 border-b border-slate-100">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Enter skills or interests (comma-separated)
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. React, Python, Node.js, Machine Learning..."
                      value={mentorSkillsQuery}
                      onChange={(e) => setMentorSkillsQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    Find Matches
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Match ranking is computed via Jaccard similarity index based on overlapping skills.
                </p>
              </form>
            </div>

            {/* Results Area */}
            {hasSearchedMentors && (
              <div className="space-y-4">
                <div className="flex justify-between items-center max-w-7xl mx-auto">
                  <h3 className="text-lg font-bold text-slate-800">
                    Mentor Matches for "{mentorSkillsQuery}"
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {matchedMentors.length} mentors found
                  </span>
                </div>

                {matchingError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{matchingError}</p>
                  </div>
                )}

                {matchingLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 text-sm font-medium">Finding the best mentors for you...</p>
                  </div>
                ) : matchedMentors.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-100">
                    <User className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-lg font-semibold text-slate-700">No Mentors Found</h3>
                    <p className="text-slate-500 mt-1 max-w-md mx-auto text-sm">
                      We didn't find any mentors who list skills. Adjust your query or encourage alumni to update their profiles!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matchedMentors.map((mentor) => {
                      const matchPct = mentor.matchPercentage ?? 0;
                      
                      // Color schemes for match percentages
                      let badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
                      if (matchPct >= 70) {
                        badgeColor = "bg-green-100 text-green-800 border-green-200";
                      } else if (matchPct >= 40) {
                        badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
                      } else if (matchPct > 0) {
                        badgeColor = "bg-orange-100 text-orange-800 border-orange-200";
                      }

                      return (
                        <div
                          key={mentor._id}
                          className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between overflow-hidden relative"
                        >
                          {/* Match Percentage Banner */}
                          <div className={`px-4 py-2 border-b text-xs font-bold flex justify-between items-center ${badgeColor}`}>
                            <span className="flex items-center gap-1">
                              <Sparkles className="h-3.5 w-3.5" />
                              Jaccard Similarity
                            </span>
                            <span>{matchPct}% Match</span>
                          </div>

                          <div className="p-6 flex-1">
                            <div className="mb-4">
                              <h3 className="text-lg font-bold text-slate-900">
                                {mentor.name}
                              </h3>
                              <div className="flex items-center gap-1 text-slate-500 text-xs mt-0.5">
                                <GraduationCap className="h-3.5 w-3.5" />
                                <span>Class of {mentor.graduationYear} &bull; {mentor.major}</span>
                              </div>
                            </div>

                            {/* Job Info */}
                            <div className="flex items-center gap-2 text-slate-700 text-sm mb-2">
                              <Briefcase className="h-4 w-4 text-slate-400 flex-shrink-0" />
                              <span className="font-semibold">{mentor.currentRole}</span>
                              <span className="text-slate-400">at</span>
                              <span className="font-semibold text-blue-600">{mentor.company}</span>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-2 text-slate-500 text-xs mb-3">
                              <MapPin className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <span>{mentor.location}</span>
                            </div>

                            {/* Bio */}
                            {mentor.bio && (
                              <p className="text-slate-600 text-xs line-clamp-2 bg-slate-50 p-2.5 rounded-lg mb-4 border border-slate-100 italic">
                                "{mentor.bio}"
                              </p>
                            )}

                            {/* Matching Skills */}
                            {mentor.matchedSkills && mentor.matchedSkills.length > 0 && (
                              <div className="mb-3">
                                <span className="text-[10px] font-bold text-green-700 block mb-1">
                                  Matching Skills:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {mentor.matchedSkills.map((skill, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-[10px] font-bold border border-green-200"
                                    >
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Other Skills */}
                            {mentor.skills && mentor.skills.length > 0 && (
                              <div>
                                <span className="text-[10px] font-bold text-slate-500 block mb-1">
                                  All Skills:
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {mentor.skills.map((skill, i) => {
                                    const isMatched = mentor.matchedSkills?.some(
                                      ms => ms.toLowerCase() === skill.toLowerCase()
                                    );
                                    if (isMatched) return null; // Already rendered in matching list
                                    return (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 rounded bg-slate-50 text-slate-500 text-[10px] font-medium border border-slate-200"
                                      >
                                        {skill}
                                      </span>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Footer Contact Details */}
                          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                            <a
                              href={`mailto:${mentor.email}`}
                              className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors font-medium"
                            >
                              <Mail className="h-4 w-4 text-slate-400" />
                              <span>Contact Email</span>
                            </a>

                            {mentor.linkedIn && (
                              <a
                                href={mentor.linkedIn.startsWith('http') ? mentor.linkedIn : `https://${mentor.linkedIn}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-slate-600 hover:text-blue-600 transition-colors font-medium"
                              >
                                <Linkedin className="h-4 w-4 text-slate-400" />
                                <span>LinkedIn</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-center py-6 text-xs">
        <p>&copy; {new Date().getFullYear()} AlumniConnect Portal. Built for alumni networking and mentoring.</p>
      </footer>
    </div>
  );
}

export default App;
