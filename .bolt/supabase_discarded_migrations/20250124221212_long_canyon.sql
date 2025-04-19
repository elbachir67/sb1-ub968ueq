/*
  # Add Comprehensive Resources for All Steps

  1. New Resources
    - Additional math resources (linear algebra, calculus, probability)
    - Python programming resources (basics to advanced)
    - Database resources (SQL and NoSQL)
    - Machine learning fundamentals
    - Deep learning resources
    
  2. Changes
    - Adds new resources to existing steps
    - Maintains existing resource structure
    - Includes diverse resource types (courses, books, videos, articles)
    
  3. Security
    - Maintains existing RLS policies
*/

-- Math Resources
WITH math_step AS (
  SELECT id FROM steps WHERE title = 'Mathématiques pour l''IA' LIMIT 1
)
INSERT INTO resources (step_id, title, url, type, level) VALUES
(
  (SELECT id FROM math_step),
  'Linear Algebra by Gilbert Strang (MIT)',
  'https://ocw.mit.edu/courses/mathematics/18-06-linear-algebra-spring-2010/',
  'course',
  'intermediate'
),
(
  (SELECT id FROM math_step),
  'Calculus for Machine Learning',
  'https://www.coursera.org/learn/multivariate-calculus-machine-learning',
  'course',
  'intermediate'
),
(
  (SELECT id FROM math_step),
  'Statistics and Probability in Data Science using Python',
  'https://www.edx.org/course/statistics-and-probability-in-data-science-using-python',
  'course',
  'intermediate'
);

-- Python Resources
WITH python_step AS (
  SELECT id FROM steps WHERE title = 'Programmation Python' LIMIT 1
)
INSERT INTO resources (step_id, title, url, type, level) VALUES
(
  (SELECT id FROM python_step),
  'Python Scientific Stack Overview',
  'https://scipy-lectures.org/',
  'course',
  'intermediate'
),
(
  (SELECT id FROM python_step),
  'Pandas for Data Analysis',
  'https://pandas.pydata.org/docs/getting_started/tutorials.html',
  'article',
  'basic'
),
(
  (SELECT id FROM python_step),
  'Advanced Python Features',
  'https://realpython.com/tutorials/advanced/',
  'article',
  'advanced'
);

-- Database Resources
WITH db_step AS (
  SELECT id FROM steps WHERE title = 'Bases de Données' LIMIT 1
)
INSERT INTO resources (step_id, title, url, type, level) VALUES
(
  (SELECT id FROM db_step),
  'SQL Tutorial for Data Science',
  'https://mode.com/sql-tutorial/',
  'course',
  'basic'
),
(
  (SELECT id FROM db_step),
  'MongoDB University',
  'https://university.mongodb.com/',
  'course',
  'intermediate'
),
(
  (SELECT id FROM db_step),
  'Database Design Case Studies',
  'https://www.db-book.com/db4/slide-dir/index.html',
  'course',
  'advanced'
);

-- Machine Learning Resources
WITH ml_step AS (
  SELECT id FROM steps WHERE title = 'Concepts Clés du Machine Learning' LIMIT 1
)
INSERT INTO resources (step_id, title, url, type, level) VALUES
(
  (SELECT id FROM ml_step),
  'Machine Learning Crash Course by Google',
  'https://developers.google.com/machine-learning/crash-course',
  'course',
  'intermediate'
),
(
  (SELECT id FROM ml_step),
  'ML Algorithms Implementation from Scratch',
  'https://github.com/eriklindernoren/ML-From-Scratch',
  'use_case',
  'advanced'
),
(
  (SELECT id FROM ml_step),
  'Practical Machine Learning Problems',
  'https://www.kaggle.com/learn/intro-to-machine-learning',
  'course',
  'basic'
);

-- Deep Learning Resources
WITH dl_step AS (
  SELECT id FROM steps WHERE title = 'Réseaux de Neurones Fondamentaux' LIMIT 1
)
INSERT INTO resources (step_id, title, url, type, level) VALUES
(
  (SELECT id FROM dl_step),
  'Deep Learning Specialization',
  'https://www.coursera.org/specializations/deep-learning',
  'course',
  'intermediate'
),
(
  (SELECT id FROM dl_step),
  'Neural Networks: Zero to Hero',
  'https://karpathy.ai/zero-to-hero.html',
  'course',
  'basic'
),
(
  (SELECT id FROM dl_step),
  'Deep Learning with PyTorch',
  'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html',
  'course',
  'intermediate'
);

-- NLP Resources
WITH nlp_step AS (
  SELECT id FROM steps WHERE title = 'Traitement du Langage Naturel' LIMIT 1
)
INSERT INTO resources (step_id, title, url, type, level) VALUES
(
  (SELECT id FROM nlp_step),
  'Natural Language Processing Specialization',
  'https://www.coursera.org/specializations/natural-language-processing',
  'course',
  'intermediate'
),
(
  (SELECT id FROM nlp_step),
  'Hugging Face NLP Course',
  'https://huggingface.co/course/chapter1/1',
  'course',
  'intermediate'
),
(
  (SELECT id FROM nlp_step),
  'Stanford CS224N NLP with Deep Learning',
  'http://web.stanford.edu/class/cs224n/',
  'course',
  'advanced'
);

-- Optimization Resources
WITH optim_step AS (
  SELECT id FROM steps WHERE title = 'Optimisation pour l''IA' LIMIT 1
)
INSERT INTO resources (step_id, title, url, type, level) VALUES
(
  (SELECT id FROM optim_step),
  'Optimization Methods for Deep Learning',
  'https://d2l.ai/chapter_optimization/',
  'course',
  'intermediate'
),
(
  (SELECT id FROM optim_step),
  'Practical Optimization Tutorial',
  'https://pytorch.org/tutorials/beginner/basics/optimization_tutorial.html',
  'article',
  'intermediate'
),
(
  (SELECT id FROM optim_step),
  'Advanced Optimization Algorithms',
  'https://ruder.io/optimizing-gradient-descent/',
  'article',
  'advanced'
);