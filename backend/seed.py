import sys
import os

# Ensure backend folder is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.rag import add_document_to_rag, collection

SEED_DOCUMENTS = [
    # --- HOSTEL & GENERAL CAMPUS GUIDELINES ---
    {
        "title": "Hostel Curfew & Entry Rules",
        "category": "hostel",
        "body": "All hostel residents must return to the hostel premises by 9:30 PM on weekdays and 10:00 PM on weekends. Late entry requires prior written permission from the hostel warden. Gate access is restricted after curfew."
    },
    {
        "title": "Hostel Mess Timings & Menu Rules",
        "category": "hostel",
        "body": "Mess operating hours: Breakfast 7:30 AM - 9:30 AM, Lunch 12:30 PM - 2:30 PM, Evening Snacks 5:00 PM - 6:00 PM, Dinner 7:30 PM - 9:30 PM. The mess closes strictly at 9:30 PM. Outside food delivery is allowed in common dining areas only."
    },
    {
        "title": "Hostel Guest Policy",
        "category": "hostel",
        "body": "Day visitors and family members are allowed in the visitor lounge between 10:00 AM and 6:00 PM. No overnight guests are allowed in student rooms without prior warden approval. Bringing unauthorized guests to rooms results in a fine."
    },
    {
        "title": "Hostel Room Maintenance & Electric Appliances",
        "category": "hostel",
        "body": "Students are responsible for room cleanliness. High wattage electrical appliances such as heaters, induction stoves, and iron boxes are strictly prohibited in hostel rooms. Routine inspections occur monthly."
    },
    {
        "title": "Hostel Laundry Facilities & Timings",
        "category": "hostel",
        "body": "Washing machine facilities are accessible in Block A and Block B basement from 6:00 AM to 10:00 PM. Students can request laundry tokens at the warden's desk. Clothes drying is allowed only in designated balcony areas."
    },
    {
        "title": "Hostel Night Out Pass Procedure",
        "category": "hostel",
        "body": "Students requesting weekend night out passes must submit their request on the student portal or warden office before 5:00 PM on Friday. Parent approval via SMS/Call is verified before issuing passes."
    },

    # --- GENERAL NOTICES ---
    {
        "title": "Mid-Semester Examination Schedule Notice",
        "category": "college",
        "body": "Mid-Semester examinations for B.Tech Semester 3 and 5 will commence from October 15th to October 22nd. Detailed timetable and room seating allocations will be published on the main department notice board."
    },
    {
        "title": "Diwali Festival Holiday Notice",
        "category": "college",
        "body": "The college campus, central library, and administrative offices will remain closed for Diwali holidays from November 1st to November 5th. Regular academic classes will resume on November 6th at 9:00 AM."
    },
    {
        "title": "Semester Tuition Fee Payment Deadline",
        "category": "college",
        "body": "The final deadline for odd-semester tuition and exam fee submission is September 30th. Payments can be completed online via the ERP portal. Late fee penalty of Rs. 100 per day applies thereafter."
    },
    {
        "title": "Central Library Rules & Book Issue Limit",
        "category": "college",
        "body": "The Central Library is open from 8:00 AM to 8:00 PM on weekdays. Undergraduate students can borrow up to 4 books for 14 days. Overdue fines are charged at Rs. 5 per day per book."
    },
    {
        "title": "FAQ: How to Apply for Hostel Room Transfer",
        "category": "hostel",
        "body": "To request a room transfer or change roommates, collect the Hostel Transfer Form from the Warden Office, obtain signatures from both room residents, and submit it during office hours (2:00 PM - 5:00 PM)."
    },
    {
        "title": "FAQ: How to Report Maintenance Issues in Hostel",
        "category": "hostel",
        "body": "To report electrical, plumbing, or carpenter maintenance issues in your room, log a complaint in the Hostel Maintenance Register located at the hostel security guard desk, or submit an online ticket."
    },
    {
        "title": "FAQ: Campus Sports Facilities Access",
        "category": "college",
        "body": "Students can access the gymnasium, basketball court, and badminton arena using their student ID card between 6:00 AM - 8:30 AM and 4:30 PM - 8:00 PM daily. Equipment borrowing requires ID deposit."
    },

    # =========================================================================
    # R23 B.TECH 1ST YEAR (SEMESTER I & II) AI & DS SYLLABUS DATA
    # =========================================================================
    {
        "title": "B.Tech I Year I Semester Course Structure (R23 AI & DS)",
        "category": "college",
        "body": "SRKR Engineering College (Autonomous) - R23 Regulation - B.Tech I Year I Semester Artificial Intelligence & Data Science Course Structure:\n"
                "- B23HS1101: Communicative English (HS, L:2, T:0, P:0, Cr:2, CIE:30, SEE:70, Total:100)\n"
                "- B23BS1101: Linear Algebra & Calculus (BS, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23BS1103: Chemistry (BS, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23CE1101: Basic Civil & Mechanical Engineering (ES, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23CS1101: Introduction to Programming (C) (ES, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23IT1101: IT Workshop (ES, L:0, T:0, P:2, Cr:1, CIE:30, SEE:70, Total:100)\n"
                "- B23BS1105: Chemistry Lab (BS, L:0, T:0, P:2, Cr:1, CIE:30, SEE:70, Total:100)\n"
                "- B23ME1102: Engineering Workshop (ES, L:0, T:0, P:3, Cr:1.5, CIE:30, SEE:70, Total:100)\n"
                "- B23CS1102: Computer Programming Lab (ES, L:0, T:0, P:3, Cr:1.5, CIE:30, SEE:70, Total:100)\n"
                "- B23HS1104: Health and Wellness, Yoga and Sports (HS, L:0, T:0, P:1, Cr:0.5, CIE:100, SEE:0, Total:100)\n"
                "Total Credits: 19.5, CIE: 370, SEE: 630, Total Marks: 1000."
    },
    {
        "title": "B23HS1101 Communicative English Syllabus",
        "category": "college",
        "body": "Course Code: B23HS1101 Category: HS Credits: 2 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: COMMUNICATIVE ENGLISH (Common to all Engineering branches).\n"
                "Unit-I (10 Hrs): Lesson: HUMAN VALUES: Gift of Magi (Short Story). Listening: Topic identification & details. Speaking: Self-introduction & general questions. Reading: Skimming & Scanning. Writing: Mechanics of Writing (Capitalization, Punctuation, Parts of Sentences). Grammar: Parts of Speech, Sentence Structures. Vocabulary: Affixes, Root words, Synonyms, Antonyms.\n"
                "Unit-II (10 Hrs): Lesson: NATURE: The Brook by Alfred Tennyson (Poem). Listening: Main and supporting ideas. Speaking: Group discussions & short talks. Reading: Sequence of ideas. Writing: Paragraph writing. Grammar: Cohesive devices, Articles, Prepositions. Vocabulary: Homonyms, Homophones, Homographs.\n"
                "Unit-III (10 Hrs): Lesson: BIOGRAPHY: Elon Musk. Listening: Global comprehension & summarizing. Speaking: Pair discussions & reporting. Reading: Context-specific clues. Writing: Summarizing, Note-making, Paraphrasing. Grammar: Tenses, Subject-Verb Agreement. Vocabulary: Words often confused, Jargons.\n"
                "Unit-IV (10 Hrs): Lesson: INSPIRATION: The Toys of Peace by Saki. Listening: Predictions in conversations. Speaking: Role plays. Reading: Graphical representation & info transfer. Writing: Letter Writing (Official Letters, Resume). Grammar: Direct/Indirect speech, Active/Passive Voice. Vocabulary: Compound words, Collocations.\n"
                "Unit-V (10 Hrs): Lesson: MOTIVATION: The Power of Intrapersonal Communication. Listening: Key terms & concepts. Speaking: Formal oral presentations. Reading: Reading comprehension. Writing: Structured essays. Grammar: Text editing & error correction. Vocabulary: Technical Jargons.\n"
                "Textbooks: Pathfinder: Communicative English (Orient BlackSwan 2023), Empowering with Language (Cengage 2023)."
    },
    {
        "title": "B23BS1101 Linear Algebra & Calculus Syllabus",
        "category": "college",
        "body": "Course Code: B23BS1101 Category: BS Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: LINEAR ALGEBRA & CALCULUS.\n"
                "Unit-I (10 Hrs): Matrices: Rank of a matrix by Echelon & Normal form. Inverse by Gauss-Jordan method. System of linear equations: Homogeneous & Non-Homogeneous equations, Gauss elimination method, Jacobi & Gauss Seidel Iteration Methods.\n"
                "Unit-II (10 Hrs): Eigen values, Eigenvectors & Orthogonal Transformation: Properties of Eigen values & Eigenvectors, Diagonalization, Cayley-Hamilton Theorem, Inverse & Power of matrix using Cayley-Hamilton, Quadratic forms, Canonical forms by Orthogonal Transformation.\n"
                "Unit-III (10 Hrs): Calculus & Mean Value Theorems: Rolle's Theorem, Lagrange's Mean Value Theorem, Cauchy's Mean Value Theorem, Taylor's and Maclaurin's series with remainders.\n"
                "Unit-IV (10 Hrs): Partial Differentiation & Applications: Functions of several variables, Continuity, Differentiability, Partial & Total derivatives, Chain rule, Directional derivative, Jacobians, Maxima & Minima of two variables, Lagrange multipliers.\n"
                "Unit-V (10 Hrs): Multiple Integrals: Double integrals, Change of order of integration, Triple integrals, Change of variables to polar, cylindrical & spherical coordinates, Finding areas & volumes.\n"
                "Textbooks: Higher Engineering Mathematics by B.S. Grewal (44th Ed), Advanced Engineering Mathematics by Erwin Kreyszig (10th Ed)."
    },
    {
        "title": "B23BS1103 Chemistry Syllabus",
        "category": "college",
        "body": "Course Code: B23BS1103 Category: BS Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: CHEMISTRY (For AIDS, AIML, CSBS, CSG & CIC).\n"
                "Unit-I (10 Hrs): Electrochemistry & Applications: Electrodes, Calomel electrode, Primary cells (Zinc-air), Secondary cells (Lithium-ion battery), Fuel cells (Hydrogen-Oxygen, PEMFC), Potentiometric & Amperometric sensors. Corrosion: Dry corrosion, Pilling-Bedworth ratio, Electrochemical theory, Galvanic & Differential aeration corrosion, Cathodic protection (Sacrificial anodic, Impressed current), Galvanizing, Tinning, Electroplating.\n"
                "Unit-II (10 Hrs): Modern Engineering Materials: Semiconductors (Intrinsic, Extrinsic, Compound), Solar Cell construction & working, Superconductors (Type-1 & Type-2), Nanomaterials (Sol-gel, Chemical precipitation, Plant-derived synthesis, Applications in catalysis, medicine, sensors).\n"
                "Unit-III (10 Hrs): Structure & Bonding Models: Schrodinger Wave equation, Psi & Psi^2, Particle in 1D box, Molecular Orbital Theory (O2, CO, N2 energy diagrams), Pi-molecular orbitals of butadiene and benzene, Bond order.\n"
                "Unit-IV (10 Hrs): Polymer Chemistry: Chain growth polymerization, Plastics (PVC, Teflon, Bakelite, Nylon-6,6, Kevlar), Elastomers (Buna-S, Buna-N), Conducting polymers (Polyacetylene, Polyaniline), Biodegradable polymers (PGA, PLA).\n"
                "Unit-V (10 Hrs): Instrumental Methods & Water Analysis: Beer-Lambert's law, UV-Visible Spectroscopy, IR Spectroscopy, Hard water & Soft water, EDTA method for total hardness, Winkler's method for Dissolved Oxygen.\n"
                "Textbooks: Engineering Chemistry by Jain & Jain (16th Ed), Text book of Applied Chemistry by IV Kasi Viswanath."
    },
    {
        "title": "B23CS1101 Introduction to Programming (C Language) Syllabus",
        "category": "college",
        "body": "Course Code: B23CS1101 Category: ES Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: INTRODUCTION TO PROGRAMMING (C Language).\n"
                "Unit-I (10 Hrs): Introduction to Computers & Programming: Basic organization of computer, Flowcharts, Algorithms, Pseudocode. C Basics: Data types, Keywords, Variables, Constants, Format Specifiers, Operators (Arithmetic, Relational, Logical, Assignment, Increment/Decrement, Bitwise, Special), Precedence & Associativity, Type conversion.\n"
                "Unit-II (10 Hrs): Control Structures: Decision Making (Simple if, if-else, nested if, else-if ladder, Switch-Case). Looping Statements (While, Do-while, For loops, Nested loops, Break and Continue).\n"
                "Unit-III (10 Hrs): Arrays & Strings: 1D & 2D Arrays, Bubble Sort, Insertion Sort, Selection Sort, Linear Search, Binary Search, Matrix Operations (Addition, Multiplication, Transpose). Strings: String handling functions, string copy & concatenation without library functions.\n"
                "Unit-IV (10 Hrs): Structures, Unions & Pointers: Structure definition, accessing elements, Array of structures, Pointer to structure, Unions vs Structures, Bit fields. Pointers: Dereferencing, Pointer arithmetic, Array access using pointers.\n"
                "Unit-V (10 Hrs): Functions & File Handling: Call by value, Call by reference, Passing arrays to functions, Dynamic memory allocation (malloc, calloc, realloc, free), Command line arguments. File Handling: File modes, Reading & Writing files, Random file access, Macros.\n"
                "Textbooks: The C Programming Language by Kernighan & Ritchie, Schaum's Outline of Programming with C by Byron Gottfried."
    },
    {
        "title": "B.Tech I Year II Semester Course Structure (R23 AI & DS)",
        "category": "college",
        "body": "SRKR Engineering College (Autonomous) - R23 Regulation - B.Tech I Year II Semester Artificial Intelligence & Data Science Course Structure:\n"
                "- B23BS1201: Differential Equations & Vector Calculus (BS, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23BS1202: Engineering Physics (BS, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23EE1201: Basic Electrical and Electronics Engineering (ES, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23ME1201: Engineering Graphics (ES, L:2, T:0, P:2, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23CS1203: Data Structures (PC, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23BS1204: Engineering Physics Lab (BS, L:0, T:0, P:2, Cr:1, CIE:30, SEE:70, Total:100)\n"
                "- B23EE1202: Electrical and Electronics Engineering Workshop (ES, L:0, T:0, P:3, Cr:1.5, CIE:30, SEE:70, Total:100)\n"
                "- B23CS1204: Data Structures Lab (PC, L:0, T:0, P:3, Cr:1.5, CIE:30, SEE:70, Total:100)\n"
                "- B23HS1201: Communicative English Lab (HS, L:0, T:0, P:2, Cr:1, CIE:30, SEE:70, Total:100)\n"
                "- B23HS1203: NSS/NCC/Scouts & Guides/Community Service (HS, L:0, T:0, P:1, Cr:0.5, CIE:100, SEE:0, Total:100)\n"
                "Total Credits: 20.5, CIE: 370, SEE: 630, Total Marks: 1000."
    },
    {
        "title": "B23CS1203 Data Structures Syllabus",
        "category": "college",
        "body": "Course Code: B23CS1203 Category: PC Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: DATA STRUCTURES (Common to AI&DS, CSE, IT, CSBS, etc).\n"
                "Unit-I (10 Hrs): Linear Data Structures & Algorithm Analysis: Definition & importance of ADTs, Time & Space complexity overview. Searching: Linear & Binary Search. Sorting: Bubble Sort, Selection Sort, Insertion Sort.\n"
                "Unit-II (10 Hrs): Linked Lists: Singly Linked Lists (representation & operations), Doubly Linked Lists, Circular Linked Lists. Applications: Polynomial expression representation, addition & multiplication, Sparse matrix representation.\n"
                "Unit-III (10 Hrs): Stacks: Stack ADT, Array & Linked List implementations, Applications (Infix to Postfix conversion, Postfix evaluation, Backtracking, Reversing list).\n"
                "Unit-IV (8 Hrs): Queues & Deques: Queue ADT, Array & Linked list implementations, Circular Queues, Priority Queues, BFS traversal. Deques (Double-ended Queues), Palindrome checking.\n"
                "Unit-V (12 Hrs): Trees & Hashing: Trees, Binary Search Tree (BST) insertion, deletion & traversals. Hashing: Hash functions, Collision resolution (Chaining, Open Addressing), Hash tables, Caching applications.\n"
                "Textbooks: Fundamentals of Data Structures in C by Horowitz & Sahni, Data Structures and Algorithm Analysis in C by Mark Allen Weiss."
    },
    {
        "title": "B23BS1202 Engineering Physics Syllabus",
        "category": "college",
        "body": "Course Code: B23BS1202 Category: BS Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: ENGINEERING PHYSICS.\n"
                "Unit-I (10 Hrs): Wave Optics: Interference in thin films, Newton's Rings. Diffraction: Fresnel & Fraunhofer diffractions, Single slit, Double slit, Diffraction Grating, Dispersive & Resolving power. Polarization: Double refraction, Nicol's Prism, Half & Quarter wave plates.\n"
                "Unit-II (10 Hrs): Crystallography & X-Ray Diffraction: Space lattice, Unit cell, Bravais lattices, Packing fraction (SC, BCC, FCC), Miller indices, Bragg's law, X-ray Diffractometer, Powder method.\n"
                "Unit-III (10 Hrs): Dielectric & Magnetic Materials: Dielectric polarizability, Clausius-Mosotti equation, Dielectric loss. Magnetic materials: Dia, Para, Ferro, Antiferro, Ferri magnetism, Hysteresis curve, Soft & Hard magnetic materials.\n"
                "Unit-IV (10 Hrs): Quantum Mechanics & Free Electron Theory: Dual nature of matter, Heisenberg Uncertainty Principle, Schrodinger time independent wave equation, Particle in 1D box. Classical & Quantum free electron theory, Fermi energy, Fermi-Dirac distribution.\n"
                "Unit-V (10 Hrs): Semiconductors: Intrinsic & Extrinsic semiconductors, Fermi level, Drift & Diffusion currents, Einstein's equation, Hall Effect & applications.\n"
                "Textbooks: A Textbook of Engineering Physics by M.N. Avadhanulu & P.G. Kshirsagar, Engineering Physics by D.K. Bhattacharya."
    },

    # =========================================================================
    # R23 B.TECH 2ND YEAR (SEMESTER I & II) AI & DS SYLLABUS DATA
    # =========================================================================
    {
        "title": "B.Tech II Year I Semester Course Structure (R23 AI & DS)",
        "category": "college",
        "body": "SRKR Engineering College (Autonomous) - R23 Regulation - B.Tech II Year I Semester Artificial Intelligence & Data Science Course Structure:\n"
                "- B23BS2101: Discrete Mathematics and Graph Theory (BS, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23HS2101: Universal Human Values-II : Understanding Harmony and Ethical Human Conduct (HS, L:2, T:1, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23IT2101: Database Management Systems (PC, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23IT2102: Object Oriented Programming through Java (PC, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23AD2101: Advanced Data Structures & Algorithm Analysis (PC, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23AD2102: Advanced Data Structures & Algorithms Lab (PC, L:0, T:0, P:3, Cr:1.5, CIE:30, SEE:70, Total:100)\n"
                "- B23IT2105: Object Oriented Programming through JAVA Lab (PC, L:0, T:0, P:3, Cr:1.5, CIE:30, SEE:70, Total:100)\n"
                "- B23IT2106: Python Programming (SEC, L:0, T:1, P:2, Cr:2, CIE:30, SEE:70, Total:100)\n"
                "- B23MC2101: English Proficiency (MC, L:2, T:0, P:0, Cr:0, CIE:30, SEE:0, Total:30)\n"
                "Total Credits: 20, CIE: 270, SEE: 560, Total Marks: 830."
    },
    {
        "title": "B23HS2101 Universal Human Values-II Syllabus",
        "category": "college",
        "body": "Course Code: B23HS2101 Category: HS Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: UNIVERSAL HUMAN VALUES-II: UNDERSTANDING HARMONY AND ETHICAL HUMAN CONDUCT (Common to all Programmes of Engineering).\n"
                "Unit-I (10 Hrs): Introduction to Value Education & Self Exploration: Need, Basic Guidelines, Content and Process for Value Education. Self-Exploration: Content and Process, Natural Acceptance, Experiential Validation, Continuous Happiness and Prosperity.\n"
                "Unit-II (10 Hrs): Harmony in the Human Being (Self and Body): Understanding Human Being as Co-existence of Self ('I') and Body. Harmony of 'I' with Body: Sanyam and Health, Correct Appraisal of Physical Needs.\n"
                "Unit-III (10 Hrs): Harmony in the Family and Society: Understanding Harmony in Family (Basic unit of human interaction), Trust (Vishwas) and Respect (Samman) as Foundational Values, Justice in Human Relationships, Extension of Family Values to Society (Undivided Society, Universal Human Order).\n"
                "Unit-IV (10 Hrs): Harmony in Nature/Existence: Interconnectedness and Mutual Fulfillment among the Four Orders of Nature (Human, Animal, Bio/Plant, Physical), Recyclability and Self-regulation, Holistic Perception of Harmony in Existence.\n"
                "Unit-V (10 Hrs): Implications of Holistic Understanding & Professional Ethics: Natural Acceptance of Human Values, Definitiveness of Ethical Human Conduct, Basis for Humanistic Education, Humanistic Constitution and Universal Human Order, Competence in Professional Ethics, Eco-friendly Production Systems.\n"
                "Textbooks: Human Values and Professional Ethics by R.R. Gaur, R. Sangal, G.P. Bagaria."
    },
    {
        "title": "B23BS2101 Discrete Mathematics & Graph Theory Syllabus",
        "category": "college",
        "body": "Course Code: B23BS2101 Category: BS Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: DISCRETE MATHEMATICS AND GRAPH THEORY (Common to CSE, CSBS, AIML, IT, AIDS, CSG, CIC, CSIT).\n"
                "Unit-I (10 Hrs): Mathematical Logic: Propositional Calculus (Statements, Connectives, WFF, Truth Tables, Tautologies, Duality Law, Normal Forms, Rules of Inference, Consistency). Predicate Calculus (Predicates, Quantifiers, Free & Bound Variables).\n"
                "Unit-II (10 Hrs): Set Theory, Relations & Functions: Operations on Sets, Inclusion-Exclusion. Relations: Properties, Equivalence relations, Partial Ordering, Hasse Diagrams, Lattices. Functions: Bijective, Composition, Inverse, Permutation, Recursive functions.\n"
                "Unit-III (12 Hrs): Combinatorics & Recurrence Relations: Counting principles, Permutations & Combinations, Circular & Restricted permutations, Binomial & Multinomial Theorems. Recurrence Relations: Generating functions, Solving homogeneous & inhomogeneous recurrence relations.\n"
                "Unit-IV (10 Hrs): Graph Theory: Graphs, Subgraphs, Adjacency & Incidence matrices, Isomorphic graphs, Paths, Circuits, Eulerian & Hamiltonian graphs.\n"
                "Unit-V (8 Hrs): Multi Graphs & Trees: Bipartite & Planar graphs, Euler's Theorem, Graph coloring, Chromatic number. Trees: Spanning trees, BFS & DFS spanning trees, Prim's and Kruskal's Algorithms.\n"
                "Textbooks: Discrete Mathematical Structures with Applications to Computer Science by Tremblay & Manohar, Discrete Mathematics for Computer Scientists by Mott, Kandel & Baker."
    },
    {
        "title": "B23IT2101 Database Management Systems (DBMS) Syllabus",
        "category": "college",
        "body": "Course Code: B23IT2101 Category: PC Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: DATABASE MANAGEMENT SYSTEMS (DBMS).\n"
                "Unit-I (10 Hrs): Introduction: Database system vs File system, Users, Architecture (3-tier), Schema, Instance, ER Model (Entities, Attributes, Relationships, ER Diagrams, Specialization, Generalization).\n"
                "Unit-II (8 Hrs): Relational Model & SQL: Relational Algebra & Calculus. Basic SQL: DDL, DML operations (Create, Alter, Insert, Delete, Update), Constraints (Domain, Key, Integrity).\n"
                "Unit-III (10 Hrs): Structured Query Language: Complex SQL Queries, Select & Where clauses, Joins, Grouping, Aggregation, Sub-queries, Views, Set operations.\n"
                "Unit-IV (10 Hrs): Schema Refinement (Normalization): Functional Dependencies, Normal Forms (1NF, 2NF, 3NF, BCNF, 4NF, 5NF), Lossless Join & Dependency Preservation.\n"
                "Unit-V (12 Hrs): Transaction Management & Indexing: ACID properties, Serializability, Concurrency control (Lock-based, Timestamp-based, Optimistic), Deadlocks, Recovery. Indexing: B+ Trees, Hash Indexing.\n"
                "Textbooks: Database Management Systems by Raghu Ramakrishnan & Johannes Gehrke, Database System Concepts by Silberschatz, Korth & Sudarshan."
    },
    {
        "title": "B23IT2102 Object Oriented Programming through Java Syllabus",
        "category": "college",
        "body": "Course Code: B23IT2102 Category: PC Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: OBJECT ORIENTED PROGRAMMING THROUGH JAVA.\n"
                "Unit-I (10 Hrs): Program Structure in Java: Tokens, I/O operations (Scanner), Data Types, Operators, Control Statements (if-else, switch, loops).\n"
                "Unit-II (10 Hrs): Classes, Objects & Methods: Class declarations, Constructors, Overloading, Access Control, Keyword 'this', Wrapper classes (Autoboxing/Unboxing), Static & Final attributes.\n"
                "Unit-III (10 Hrs): Arrays, Inheritance & Interfaces: 1D/2D Arrays, Inheritance types, 'super' keyword, Method Overriding, Abstract Classes, Interfaces, Default & Static methods, Annotations.\n"
                "Unit-IV (10 Hrs): Packages, Exception Handling & Multithreading: User-defined Packages. Exceptions: try, catch, finally, throw, throws, Custom Exceptions. Multithreading: Thread class, Runnable interface, Synchronization. Java I/O streams.\n"
                "Unit-V (10 Hrs): String Handling, JDBC & JavaFX: String & StringBuffer classes. JDBC Architecture, Database connection, ResultSet. JavaFX GUI: Scene Builder, Layouts, Event handling.\n"
                "Textbooks: JAVA One Step Ahead by Anitha Seth & B.L. Juneja, Joy with JAVA by Debasis Samanta."
    },
    {
        "title": "B23AD2101 Advanced Data Structures & Algorithm Analysis Syllabus",
        "category": "college",
        "body": "Course Code: B23AD2101 Category: PC Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: ADVANCED DATA STRUCTURES & ALGORITHM ANALYSIS (For AI & DS).\n"
                "Unit-I (10 Hrs): Advanced Trees: AVL Trees (Creation, Insertion, Deletion, Applications), B-Trees (Operations & Applications), Heap Trees (Min & Max Heaps, Priority Queues).\n"
                "Unit-II (10 Hrs): Graphs & Divide and Conquer: Graph traversals, Connected components. Algorithm Analysis: Time & Space complexity, Asymptotic notations. Divide & Conquer: Quick Sort, Merge Sort, Strassen's Matrix Multiplication, Convex Hull.\n"
                "Unit-III (10 Hrs): Greedy & Dynamic Programming: Greedy: Job Sequencing, Knapsack Problem, Minimum Cost Spanning Trees, Single Source Shortest Path. Dynamic Programming: All-Pairs Shortest Path (Floyd-Warshall), Bellman-Ford, 0/1 Knapsack, Traveling Salesperson Problem (TSP).\n"
                "Unit-IV (10 Hrs): Backtracking & Branch and Bound: Backtracking: 8-Queens Problem, Sum of Subsets, Graph Coloring. Branch & Bound: 0/1 Knapsack, TSP.\n"
                "Unit-V (10 Hrs): NP-Hard & NP-Complete Problems: Cook's theorem, Clique Decision Problem, Chromatic Number Problem, Job Shop Scheduling.\n"
                "Textbooks: Fundamentals of Data Structures in C++ by Horowitz, Sahni & Mehta, Computer Algorithms in C++ by Horowitz, Sahni & Rajasekaran."
    },
    {
        "title": "B.Tech II Year II Semester Course Structure (R23 AI & DS)",
        "category": "college",
        "body": "SRKR Engineering College (Autonomous) - R23 Regulation - B.Tech II Year II Semester Artificial Intelligence & Data Science Course Structure:\n"
                "- B23HS2201: Managerial Economics and Financial Analysis (HS, L:2, T:0, P:0, Cr:2, CIE:30, SEE:70, Total:100)\n"
                "- B23BS2202: Statistical Methods for Data Science (ES, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23AD2201: Introduction to Data Science (PC, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23AD2202: Artificial Intelligence (PC, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23AD2203: Computer Organization (ES, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23AD2204: Artificial Intelligence Lab (PC, L:0, T:0, P:3, Cr:1.5, CIE:30, SEE:70, Total:100)\n"
                "- B23AD2205: Data Science using Python Lab (PC, L:0, T:0, P:3, Cr:1.5, CIE:30, SEE:70, Total:100)\n"
                "- B23AD2206: Full Stack Development-1 (SEC, L:0, T:1, P:2, Cr:2, CIE:30, SEE:70, Total:100)\n"
                "- B23AD2207: Design Thinking & Innovation (ES, L:1, T:0, P:2, Cr:2, CIE:30, SEE:70, Total:100)\n"
                "- B23MC2202: Environmental Science (MC, L:2, T:0, P:0, Cr:0, CIE:30, SEE:0, Total:30)\n"
                "Total Credits: 21, CIE: 300, SEE: 630, Total Marks: 930."
    },
    {
        "title": "B23AD2202 Artificial Intelligence Syllabus",
        "category": "college",
        "body": "Course Code: B23AD2202 Category: PC Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: ARTIFICIAL INTELLIGENCE (For AIDS).\n"
                "Unit-I (10 Hrs): Introduction to AI & Intelligent Agents: Foundations of AI, Agents and Environments, Rationality, Structure of agents, Problem solving agents, Tic-Tac-Toe game.\n"
                "Unit-II (10 Hrs): State-Space Search & Game Playing: Heuristic search techniques, A* algorithm, Constraint Satisfaction. Game Playing: Alpha-Beta pruning, Two-player games.\n"
                "Unit-III (10 Hrs): Logic & Uncertainty: Propositional Logic, Predicate Logic, Resolution Refutation, Fuzzy Logic, Fuzzy Set operations.\n"
                "Unit-IV (8 Hrs): Knowledge Representation & Reasoning: Semantic Networks, Frames, Scripts, Conceptual Dependency, Reasoning under uncertainty, Bayes Probabilistic Inference, Dempster-Shafer theory.\n"
                "Unit-V (12 Hrs): Planning & Expert Systems: Goal Stack Planning, Non-linear planning. Expert Systems: Architecture, Knowledge Acquisition, MYCIN, DART, XCON.\n"
                "Textbooks: Artificial Intelligence by Saroj Kaushik, Artificial Intelligence: A Modern Approach by Stuart Russell & Peter Norvig."
    },

    # =========================================================================
    # R23 B.TECH 3RD YEAR (SEMESTER I & II) AI & DS SYLLABUS DATA
    # =========================================================================
    {
        "title": "B.Tech III Year I Semester Course Structure (R23 AI & DS)",
        "category": "college",
        "body": "SRKR Engineering College (Autonomous) - R23 Regulation - B.Tech III Year I Semester Artificial Intelligence & Data Science Course Structure:\n"
                "- B23AD3101: Fundamentals of Data Mining (PC, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23AD3102: Principles of Machine Learning (PC, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23AD3103: Operating Systems (PC, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- Professional Elective-I (#PE-I): OOAD (B23AD3104), Soft Computing (B23AD3105), IoT (B23AD3106), EDA with Python (B23AD3107), Computer Networks (B23AD3108) (PE-I, Cr:3)\n"
                "- Open Elective-I (#OE-I): Offered by CE/ECE/EEE/ME/S&H (OE-I, Cr:3)\n"
                "- B23AD3110: Data Mining and Machine Learning Lab (PC, L:0, T:0, P:3, Cr:1.5, CIE:30, SEE:70, Total:100)\n"
                "- B23AD3111: Data Visualization Lab (PC, L:0, T:0, P:3, Cr:1.5, CIE:30, SEE:70, Total:100)\n"
                "- B23BS3101: Soft Skills (SEC, L:0, T:1, P:2, Cr:2, CIE:30, SEE:70, Total:100)\n"
                "- B23AD3112: User Interface Design Using Flutter (Tinkering Lab) (ES, L:0, T:0, P:2, Cr:1, CIE:30, SEE:70, Total:100)\n"
                "- B23AD3113: Evaluation of Community Service Internship (PR, Cr:2, CIE:0, SEE:50, Total:50)\n"
                "Total Credits: 23, CIE: 270, SEE: 680, Total Marks: 950."
    },
    {
        "title": "B23AD3102 Principles of Machine Learning Syllabus",
        "category": "college",
        "body": "Course Code: B23AD3102 Category: PC Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: PRINCIPLES OF MACHINE LEARNING (For AIDS).\n"
                "Unit-I (10 Hrs): Introduction to Machine Learning: AI vs ML vs DL, Supervised/Unsupervised/Reinforcement Learning, Data Acquisition, Feature Selection & Extraction, Overfitting vs Underfitting, Bias-Variance Tradeoff.\n"
                "Unit-II (10 Hrs): Regression & Regularization: Linear Regression, Non-Linear Regression, Regularization (Ridge vs Lasso Regression), Logistic Regression for Binary Classification.\n"
                "Unit-III (10 Hrs): Classification & Decision Trees: Decision Trees (ID3 algorithm), Evaluation metrics (Accuracy, Precision, Recall, F1-score, ROC), Naive Bayes Classifier, K-Nearest Neighbors (KNN).\n"
                "Unit-IV (10 Hrs): Support Vector Machines & Ensemble Learning: SVM (Linear, Non-Linear, SVR), Ensemble methods (Bagging, Boosting, Stacking, Random Forest). Clustering: K-Means, K-Medoids.\n"
                "Unit-V (10 Hrs): Advanced ML & Neural Networks: Dimensionality Reduction (PCA), Artificial Neural Networks (Perceptron, Multi-Layer Perceptron, Backpropagation), Reinforcement Learning basics.\n"
                "Textbooks: Machine Learning by Tom M. Mitchell, Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow by Aurelien Geron."
    },
    {
        "title": "B23AD3101 Fundamentals of Data Mining Syllabus",
        "category": "college",
        "body": "Course Code: B23AD3101 Category: PC Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: FUNDAMENTALS OF DATA MINING (For AIDS).\n"
                "Unit-I (10 Hrs): Data Warehousing & OLAP: Data Warehouse Modeling, OLTP vs OLAP, ETL operations, Data Cube operations (Roll-Up, Drill-Down, Slice, Dice, Pivot). Intro to Data Mining.\n"
                "Unit-II (10 Hrs): Data Pre-processing: Data Cleaning, Integration, Reduction, Transformation, Discretization, Data Similarity & Dissimilarity measures.\n"
                "Unit-III (10 Hrs): Classification: Decision Tree Induction, Rule-Based Classifiers, Bayesian Classification (Bayes Theorem, Naive Bayes).\n"
                "Unit-IV (10 Hrs): Association Analysis: Frequent Itemset Generation, Apriori Algorithm, Rule Pruning, FP-Growth Algorithm.\n"
                "Unit-V (10 Hrs): Cluster Analysis: K-Means, Bisecting K-Means, Agglomerative Hierarchical Clustering, BIRCH, DBSCAN, OPTICS.\n"
                "Textbooks: Data Mining Concepts and Techniques by Jiawei Han & Michel Kamber, Introduction to Data Mining by Pang-Ning Tan."
    },
    {
        "title": "B23AD3103 Operating Systems Syllabus",
        "category": "college",
        "body": "Course Code: B23AD3103 Category: PC Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: OPERATING SYSTEMS (For AIDS).\n"
                "Unit-I (10 Hrs): OS Overview & System Structures: OS Functions, System Calls, Operating System Design & Building/Booting.\n"
                "Unit-II (10 Hrs): Processes, Threads & CPU Scheduling: Process Concept, Inter-process Communication, Multithreading models, CPU Scheduling algorithms (FCFS, SJF, Priority, Round Robin).\n"
                "Unit-III (10 Hrs): Synchronization & Deadlocks: Critical Section problem, Peterson's solution, Mutex Locks, Semaphores, Monitors. Deadlocks: Characterization, Prevention, Avoidance (Banker's Algorithm), Detection & Recovery.\n"
                "Unit-IV (10 Hrs): Memory Management: Contiguous allocation, Paging, Page Tables, Virtual Memory (Demand Paging, Page Replacement algorithms FIFO, LRU, Optimal, Thrashing).\n"
                "Unit-V (10 Hrs): File System & System Protection: File Concept, Directory Structure, File System Implementation, Access Matrix, Protection Domains.\n"
                "Textbooks: Operating System Concepts by Silberschatz, Galvin & Gagne (10th Ed), Modern Operating Systems by Tanenbaum."
    },
    {
        "title": "B.Tech III Year II Semester Course Structure (R23 AI & DS)",
        "category": "college",
        "body": "SRKR Engineering College (Autonomous) - R23 Regulation - B.Tech III Year II Semester Artificial Intelligence & Data Science Course Structure:\n"
                "- B23AD3201: Big Data Analytics (PC, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23AD3202: Deep Learning (PC, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- B23AD3203: Natural Language Processing (PC, L:3, T:0, P:0, Cr:3, CIE:30, SEE:70, Total:100)\n"
                "- Professional Elective-II (#PE-II): Cryptography & Network Security (B23AD3204), OOSE (B23AD3205), Recommender Systems (B23AD3206), Computer Vision (B23AD3207), Automata & Compiler Design (B23AD3208) (PE-II, Cr:3)\n"
                "- Professional Elective-III (#PE-III): Quantum Computing (B23AD3210), NoSQL Databases (B23AD3211), Cloud Computing (B23AD3212), Social Media Analytics (B23AD3213) (PE-III, Cr:3)\n"
                "- Open Elective-II (#OE-II): Open Elective II (Cr:3)\n"
                "- B23AD3215: Deep Learning & NLP Lab (PC, L:0, T:0, P:3, Cr:1.5, CIE:30, SEE:70, Total:100)\n"
                "- B23AD3216: Big Data Analytics Lab (PC, L:0, T:0, P:3, Cr:1.5, CIE:30, SEE:70, Total:100)\n"
                "- B23AD3217: Full Stack Development-2 (SEC, L:0, T:1, P:2, Cr:2, CIE:30, SEE:70, Total:100)\n"
                "- B23AC3201: Technical Paper Writing & IPR (AC, L:2, T:0, P:0, Cr:0, CIE:30, SEE:0, Total:30)\n"
                "- B23MC3201: Employability Skills (MC, L:2, T:0, P:0, Cr:0, CIE:30, SEE:0, Total:30)\n"
                "Total Credits: 23, CIE: 330, SEE: 630, Total Marks: 960."
    },
    {
        "title": "B23AD3202 Deep Learning Syllabus",
        "category": "college",
        "body": "Course Code: B23AD3202 Category: PC Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: DEEP LEARNING (For AIDS).\n"
                "Unit-I (10 Hrs): Introduction to Deep Learning: Biological Neuron, McCulloch-Pitts unit, Thresholding logic, Linear Perceptron, Perceptron Learning Algorithm, Convergence theorem.\n"
                "Unit-II (10 Hrs): Artificial Neural Networks (ANN): Multilayer Perceptrons, Backpropagation, Gradient Descent, Activation Functions (ReLU, Sigmoid, Tanh, Softmax), Loss Functions (MSE, Cross-Entropy), Dropout, L1/L2 Regularization.\n"
                "Unit-III (10 Hrs): Convolutional Neural Networks (CNN): Convolution & Pooling, CNN Architectures (LeNet, AlexNet, VGG, ResNet), Transfer Learning, Object Detection (YOLO, SSD, Faster R-CNN).\n"
                "Unit-IV (10 Hrs): Recurrent Neural Networks (RNN) & NLP: Sequential Data Processing, RNN, LSTMs, Word Embeddings (Word2Vec, GloVe), Attention Mechanisms, Transformers, LLMs (BERT, GPT).\n"
                "Unit-V (10 Hrs): Advanced Deep Learning: Generative Models (GANs, VAEs), Deep Q Networks, Explainable AI, Model Deployment (Flask, FastAPI).\n"
                "Textbooks: Deep Learning by Ian Goodfellow, Yoshua Bengio & Aaron Courville."
    },
    {
        "title": "B23AD3203 Natural Language Processing (NLP) Syllabus",
        "category": "college",
        "body": "Course Code: B23AD3203 Category: PC Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: NATURAL LANGUAGE PROCESSING (For AIDS).\n"
                "Unit-I (10 Hrs): Introduction & Language Modeling: Grammar-based LM, Statistical LM, Regular Expressions, Finite-State Automata, Tokenization, Spelling Correction, Minimum Edit Distance.\n"
                "Unit-II (10 Hrs): Word Level Analysis: N-grams, Smoothing, Part-of-Speech (POS) Tagging (Rule-based, Stochastic, HMM).\n"
                "Unit-III (10 Hrs): Syntactic Analysis: Context-Free Grammars (CFG), Dependency Grammar, Parsing (CYK algorithm), Probabilistic CFGs.\n"
                "Unit-IV (10 Hrs): Semantics & Pragmatics: First-Order Logic, Word Sense Disambiguation (WSD), Thesaurus methods, Distributional similarity.\n"
                "Unit-V (10 Hrs): Discourse Analysis & Lexical Resources: Anaphora resolution, Coreference resolution, WordNet, Penn Treebank, Brown Corpus.\n"
                "Textbooks: Speech and Language Processing by Daniel Jurafsky & James H. Martin."
    },
    {
        "title": "B23AD3201 Big Data Analytics Syllabus",
        "category": "college",
        "body": "Course Code: B23AD3201 Category: PC Credits: 3 CIE: 30 SEE: 70 Exam: 3 Hrs. Course: BIG DATA ANALYTICS (For AIDS).\n"
                "Unit-I (10 Hrs): Intro to Big Data & HDFS: Characteristics of Big Data, Distributed File Systems (GFS, HDFS v1 & v2 architecture).\n"
                "Unit-II (10 Hrs): HDFS Design & MapReduce: HDFS Blocks, Replication, Rack awareness, MapReduce job execution (YARN, Shuffle & Sort).\n"
                "Unit-III (12 Hrs): Hadoop Data Analysis: Hadoop Streaming, Java MapReduce (Mapper, Reducer, Driver, Word Count, Matrix Multiplication).\n"
                "Unit-IV (8 Hrs): Stream Processing & Spark: Mining Data Streams (Bloom Filter, DGIM algorithm), Apache Spark RDD operations & Architecture.\n"
                "Unit-V (10 Hrs): Pig, Hive & HBase: Pig Latin scripting, Hive Architecture & HiveQL queries, HBase data model & Zookeeper.\n"
                "Textbooks: Hadoop: The Definitive Guide by Tom White (3rd Ed)."
    }
]

def seed_database():
    print("Resetting/seeding ChromaDB with campus documents...")
    total_chunks = 0
    for doc in SEED_DOCUMENTS:
        res = add_document_to_rag(doc["title"], doc["body"], doc["category"])
        chunks_added = res.get("chunks", 1) if isinstance(res, dict) else res
        total_chunks += chunks_added
        print(f"  [+] Added '{doc['title']}' ({doc['category']}) -> {chunks_added} chunk(s)")
    
    print(f"\nSeeding complete! {len(SEED_DOCUMENTS)} documents ({total_chunks} chunks) seeded successfully into ChromaDB persistent store.")

if __name__ == "__main__":
    seed_database()
