'use strict';

/* =========================================================================
   RESUME (structured)
   -------------------------------------------------------------------------
   `cat resume.md` renders this object automatically — the file appears in
   `ls`, but its content comes from here. Edit any field below and reload
   the page (e.g. add a job under `experience:`).
   ========================================================================= */

(function (TC) {
    TC.resume = {
        name: 'John Doe',
        title: 'Software Developer',

        contact: {
            email: 'john.doe@example.com',
            phone: '(123) 456-7890',
            linkedin: 'linkedin.com/in/johndoe',
            github: 'github.com/johndoe'
        },

        summary: 'Detail-oriented software developer with 5+ years of experience ' +
            'in building scalable web applications. Proficient in JavaScript, ' +
            'TypeScript, and React. Passionate about creating efficient and ' +
            'user-friendly interfaces.',

        skills: {
            languages: 'JavaScript, TypeScript, Python',
            frameworks: 'React, Node.js, Express',
            databases: 'MongoDB, PostgreSQL',
            tools: 'Git, Docker, Vite'
        },

        experience: [
            {
                role: 'Software Developer',
                company: 'ABC Corp, City, State',
                period: 'June 2020 - Present',
                points: [
                    'Developed and maintained web applications using React and Node.js.',
                    'Collaborated with cross-functional teams to define, design, and ship features.',
                    'Implemented RESTful APIs and integrated third-party services.'
                ]
            },
            {
                role: 'Junior Developer',
                company: 'XYZ Inc, City, State',
                period: 'January 2018 - May 2020',
                points: [
                    'Assisted in the development of internal tools and applications.',
                    'Wrote clean, maintainable code and participated in code reviews.',
                    'Contributed to migration of legacy systems to modern frameworks.'
                ]
            }
        ],

        education: [
            {
                degree: 'B.Sc. Computer Science',
                school: 'University of Technology, City, State',
                period: 'Graduated: May 2017',
                points: [
                    'Coursework: Data Structures, Algorithms, Web Development, Database Management'
                ]
            }
        ],

        certifications: [
            'Certified JavaScript Developer',
            'React Professional Certification'
        ],

        projects: [
            { name: 'Portfolio Website', desc: 'Personal portfolio to showcase projects and skills.' },
            { name: 'Task Manager App', desc: 'Task management app using React + Node.js backend.' }
        ]
    };

    // Make `resume.md` visible to ls / cat. Its content is generated from the
    // `resume` object above by the engine, so no text is needed here.
    TC.registerFile('/resume.md', '');
})(window.TERMINAL_CONTENT);
