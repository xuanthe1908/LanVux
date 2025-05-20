// src/pages/AboutPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { 
  UserGroupIcon, 
  AcademicCapIcon, 
  GlobeAltIcon, 
  LightBulbIcon,
  RocketLaunchIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-primary-700">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover mix-blend-multiply filter brightness-50"
            src="/images/about-hero.jpg"
            alt="Students learning"
          />
          <div className="absolute inset-0 bg-primary-700 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">About Us</h1>
          <p className="mt-6 max-w-3xl text-xl text-primary-100">
            Empowering the next generation of developers and technology leaders through accessible, high-quality education.
          </p>
        </div>
      </div>

      {/* Mission section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Our Mission</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Transforming education for the digital age
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our mission is to create a world where anyone, anywhere can transform their life through accessible, affordable, high-quality education.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                        <UserGroupIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Community First</h3>
                    <p className="mt-5 text-base text-gray-500">
                      We believe in the power of community. Our platform connects students with instructors and peers, fostering collaboration and shared learning experiences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                        <AcademicCapIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Quality Education</h3>
                    <p className="mt-5 text-base text-gray-500">
                      We're committed to offering the highest quality educational content, with courses developed by industry experts and regularly updated to reflect current best practices.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <div className="flow-root bg-gray-50 rounded-lg px-6 pb-8">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center p-3 bg-primary-600 rounded-md shadow-lg">
                        <GlobeAltIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </span>
                    </div>
                    <h3 className="mt-8 text-lg font-medium text-gray-900 tracking-tight">Global Access</h3>
                    <p className="mt-5 text-base text-gray-500">
                      We're breaking down barriers to education, making it accessible to learners worldwide, regardless of location, background, or economic circumstance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Our Story
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Founded in 2020, E-Learning Platform began with a simple idea: make quality tech education accessible to everyone. What started as a small collection of coding tutorials has grown into a comprehensive platform offering courses in web development, data science, mobile development, and design.
              </p>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Our founder, a software engineer with a passion for teaching, recognized the gap between traditional education and the rapidly evolving tech industry. E-Learning Platform was created to bridge that gap, providing practical, industry-relevant courses that prepare students for real-world challenges.
              </p>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                Today, we're proud to have helped over 100,000 students worldwide advance their careers and achieve their goals. Our community continues to grow, united by a shared commitment to lifelong learning and professional development.
              </p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-0.5 md:grid-cols-3 lg:mt-0 lg:grid-cols-2">
              <div className="col-span-1 flex justify-center py-8 px-8 bg-white">
                <img className="max-h-12" src="/images/stats-students.svg" alt="Students" />
                <div className="ml-4">
                  <div className="text-3xl font-bold text-primary-600">100K+</div>
                  <div className="text-gray-500">Students</div>
                </div>
              </div>
              <div className="col-span-1 flex justify-center py-8 px-8 bg-white">
                <img className="max-h-12" src="/images/stats-courses.svg" alt="Courses" />
                <div className="ml-4">
                  <div className="text-3xl font-bold text-primary-600">500+</div>
                  <div className="text-gray-500">Courses</div>
                </div>
              </div>
              <div className="col-span-1 flex justify-center py-8 px-8 bg-white">
                <img className="max-h-12" src="/images/stats-instructors.svg" alt="Instructors" />
                <div className="ml-4">
                  <div className="text-3xl font-bold text-primary-600">200+</div>
                  <div className="text-gray-500">Instructors</div>
                </div>
              </div>
              <div className="col-span-1 flex justify-center py-8 px-8 bg-white">
                <img className="max-h-12" src="/images/stats-countries.svg" alt="Countries" />
                <div className="ml-4">
                  <div className="text-3xl font-bold text-primary-600">150+</div>
                  <div className="text-gray-500">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values section */}
      <div className="bg-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Our Values</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              What we believe in
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our values guide everything we do, from course creation to student support.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mx-auto">
                  <RocketLaunchIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">Innovation</h3>
                <p className="mt-2 text-base text-gray-500">
                  We embrace change and continuously seek new ways to improve our platform and courses.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mx-auto">
                  <LightBulbIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">Excellence</h3>
                <p className="mt-2 text-base text-gray-500">
                  We strive for excellence in everything we do, from course content to student support.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary-600 text-white mx-auto">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">Inclusivity</h3>
                <p className="mt-2 text-base text-gray-500">
                  We believe education should be accessible to all, and we're committed to creating an inclusive learning environment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team section */}
      <div className="bg-gray-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Our Team</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Meet the people behind E-Learning Platform
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our dedicated team of educators, developers, and designers are committed to creating the best learning experience possible.
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: 'John Smith',
                  role: 'Founder & CEO',
                  image: '/images/team-1.jpg',
                  bio: 'Former software engineer with 15+ years of experience in the tech industry. Passionate about making education accessible to all.'
                },
                {
                  name: 'Emily Johnson',
                  role: 'Chief Learning Officer',
                  image: '/images/team-2.jpg',
                  bio: 'Educational psychologist with expertise in online learning. Leads course development and ensures educational quality.'
                },
                {
                  name: 'Michael Chen',
                  role: 'CTO',
                  image: '/images/team-3.jpg',
                  bio: 'Tech visionary responsible for our platform architecture and innovative learning tools. Previously led engineering teams at major tech companies.'
                },
                {
                  name: 'Sarah Williams',
                  role: 'Head of Content',
                  image: '/images/team-4.jpg',
                  bio: 'Curriculum development expert with a background in computer science education. Ensures our courses are comprehensive and up-to-date.'
                },
                {
                  name: 'David Rodriguez',
                  role: 'Head of Instructor Success',
                  image: '/images/team-5.jpg',
                  bio: 'Works closely with our instructor community to help them create engaging, effective courses that students love.'
                },
                {
                  name: 'Lisa Chen',
                  role: 'Chief Marketing Officer',
                  image: '/images/team-6.jpg',
                  bio: 'Digital marketing specialist with a passion for education. Helps connect students worldwide with the courses they need.'
                }
              ].map((person, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="aspect-w-3 aspect-h-2">
                    <img className="object-cover" src={person.image} alt={person.name} />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900">{person.name}</h3>
                    <p className="text-sm text-primary-600">{person.role}</p>
                    <p className="mt-3 text-base text-gray-500">{person.bio}</p>
                    <div className="mt-4 flex space-x-3">
                      <a href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">Twitter</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                        </svg>
                      </a>
                      <a href="#" className="text-gray-400 hover:text-gray-500">
                        <span className="sr-only">LinkedIn</span>
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Join us section */}
      <div className="bg-primary-700">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to start learning?</span>
            <span className="block text-primary-200">Join our growing community today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/register">
                <Button variant="outline" size="lg" className="bg-white hover:bg-gray-50">
                  Sign Up
                </Button>
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link to="/courses">
                <Button variant="primary" size="lg" className="bg-primary-600 hover:bg-primary-500">
                  Explore Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;